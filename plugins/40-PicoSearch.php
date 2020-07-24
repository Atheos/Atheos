<?php

/**
 *
 * @author Pontus Horn
 * @link https://pontushorn.me
 * @repository https://github.com/PontusHorn/Pico-Search
 * @license http://opensource.org/licenses/MIT
 */

class PicoSearch extends AbstractPicoPlugin
{

    private $search_area;
    private $search_terms;

    /**
     * Parses the requested URL to determine if a search has been requested. The search may be
     * scoped to a folder. An example URL: yourdomain.com/blog/search/foobar/page/2,
     * which searches the /blog folder for "foobar" and shows the second page of results using
     * e.g. https://github.com/rewdy/Pico-Pagination.
     *
     * @see    Pico::getBaseUrl()
     * @see    Pico::getRequestUrl()
     * @param  string &$url request URL
     * @return void
     */
    public function onRequestUrl(&$url)
    {
        // If form was submitted without being intercepted by JavaScript, redirect to the canonical search URL.
        if (preg_match('~^(.+/)?search$~', $url) && $_GET['q']) {
            header('Location: ' . $this->getPico()->getBaseUrl() . $url . '/' . urlencode($_GET['q']));
            exit;
        }

        if (preg_match('~^(.+/)?search/([^/]+)(/.+)?$~', $url, $matches)) {
            $this->search_terms = urldecode($matches[2]);

            if (!empty($matches[1])) {
                $this->search_area = $matches[1];
            }
        }
    }

    /**
     * If accessing search results, {@link Pico::discoverRequestFile()} will have failed since
     * the search terms are included in the URL but do not map to a file. This method takes care
     * of finding the appropriate file.
     *
     * @see    Pico::discoverRequestFile()
     * @param  string &$file request file
     * @return void
     */
    public function onRequestFile(&$file)
    {
        if ($this->search_terms) {
            $pico = $this->getPico();
            $folder = '';

            // Aggressively strip out any ./ or ../ parts from the search area before using it
            // as the folder to look in. Should already be taken care of previously, but just
            // as a safeguard to make sure nothing slips through the cracks.
            if ($this->search_area) {
                $folder = str_replace('\\', '/', $this->search_area);
                $folder = preg_replace('~\.+/~', '', $folder);
            }

            $temp_file = $pico->getConfig('content_dir') . $folder . 'search' . $pico->getConfig('content_ext');
            if (file_exists($temp_file)) {
                $file = $temp_file;
            }
        }
    }

    /**
     * Filter the input array to pages matching the search terms
     * and sort them by relevance.
     *
     * @param  array $pages data of all known pages
     * @return array filtered and sorted pages
     */
    public function applySearch($pages)
    {
        if (!isset($this->search_area) && !isset($this->search_terms)) {
            return array();
        }

        if (isset($this->search_area)) {
            $pages = array_filter($pages, function ($page) {
                return substr($page['id'], 0, strlen($this->search_area)) === $this->search_area;
            });
        }

        $pico = $this->getPico();
        $excludes = $pico->getConfig('search_excludes');
        if (!empty($excludes)) {
            foreach ($excludes as $exclude_path) {
                unset($pages[$exclude_path]);
            }
        }

        if (isset($this->search_terms)) {
            $pages = array_map(function ($page) {
                $page['search_rank'] = $this->getSearchRankForPage($page);
                return $page;
            }, $pages);

            $pages = array_filter($pages, function ($page) {
                return $page['search_rank'] > 0;
            });

            uasort($pages, function ($a, $b) {
                if ($a['search_rank'] == $b['search_rank']) {
                    return 0;
                }

                return $a['search_rank'] > $b['search_rank'] ? -1 : 1;
            });
        }

        return $pages;
    }

    public function getSearchRankForPage($page) {
        // If there's an exact match in the title, skip a bunch of work and give it a very high score
        $escaped_search_terms = preg_quote($this->search_terms, '/');
        if (preg_match("/\b$escaped_search_terms\b/iu", $page['title']) === 1) {
            return 5;
        }

        $searchTerms = preg_split('/\s+/', $this->search_terms);
        $keyTerms = array_filter($searchTerms, function ($searchTerm) {
            return !$this->isLowValueWord($searchTerm);
        });

        // Only search through key terms if any exist
        if (!empty($keyTerms)) {
            $searchTerms = $keyTerms;
        }

        return array_sum(
            array_map(
                function ($searchTerm) use ($page) {
                    return $this->getSearchRankForString($searchTerm, $page['title']) +
                        $this->getSearchRankForString($searchTerm, $page['raw_content']) * 0.2;
                },
                $searchTerms
            )
        );
    }

    public function getSearchRankForString($searchTerm, $content) {
        $searchTermValue = $this->isLowValueWord($searchTerm) ? 0.2 : 1;
        $escapedSearchTerm = preg_quote($searchTerm, '/');

        $fullWordMatches = preg_match_all("/\b$escapedSearchTerm\b/iu", $content);
        if ($fullWordMatches > 0) {
            return min($fullWordMatches, 3) * $searchTermValue;
        }

        $startOfWordMatches = preg_match_all("/\b$escapedSearchTerm\B/iu", $content);
        if ($startOfWordMatches > 0) {
            return min($startOfWordMatches, 3) * 0.5 * $searchTermValue;
        }

        $inWordMatches = preg_match_all("/\B$escapedSearchTerm\B/iu", $content);
        return min($inWordMatches, 3) * 0.05 * $searchTermValue;
    }

    public function isLowValueWord($word) {
        return in_array(mb_strtolower($word), $this->getPluginConfig('low_value_words') ?: []);
    }

    public function onPageRendering(&$twig, &$twigVariables, &$templateName) {
        $twigVariables['search_terms'] = $this->search_terms;
    }

    public function onTwigRegistration() {
        $this->getPico()->getTwig()->addFilter(new \Twig\TwigFilter('apply_search', [$this, 'applySearch']));
    }
}
