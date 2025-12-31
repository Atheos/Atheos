# Performance Recommendations

Based on the analysis of the frontend codebase, several areas have been identified where performance can be significantly improved, particularly for users in high-latency network environments (e.g., accessing a remote server via a work VPN).

## 1. Optimize File Opening (Critical)

Currently, opening a file triggers a "waterfall" of sequential network requests:
1.  **Request 1**: Load the Ace Editor syntax highlighter (Mode) script (e.g., `mode-php.js`).
2.  **Request 2**: Fetch the file content (`action: 'openFile'`).
3.  **Request 3**: Check/Set file focus and lock status (`action: 'check'` or `action: 'setFocus'`).

**Recommendation:**
*   **Parallelize Requests**: Initiate the file content fetch immediately, without waiting for the syntax highlighter script to finish loading.
*   **Batch Operations**: Combine the "Open File" and "Check/Focus" operations into a single API endpoint. The server should return the file content *and* the lock status in one response.
*   **Bundle Syntax Modes**: Pre-load common syntax modes or bundle them into the main JavaScript build to eliminate the first request entirely for common file types.

## 2. Improve File Tree Performance

The file tree currently fetches directory contents from the server every time a folder is expanded, even if it was previously opened and closed.

**Recommendation:**
*   **Client-Side Caching**: Cache the contents of expanded directories in the browser's memory. Only re-fetch from the server if the user explicitly refreshes the tree or if a file operation (create/delete) invalidates the cache.
*   **Debounce/Throttle**: If the user rapidly expands multiple folders, ensure requests are managed efficiently (though the current implementation waits for one to finish before showing content, this feels slow).

## 3. Reduce Network Overhead (General)

The application uses a custom `echo` library for AJAX that creates a new HTTP connection for every action.

**Recommendation:**
*   **Session Locking**: PHP sessions lock the request processing by default. If multiple AJAX requests are sent (e.g., opening a file and checking focus), they process sequentially on the server. Call `session_write_close()` in PHP controllers as soon as session data is written to allow concurrent processing of read-only requests.
*   **HTTP/2**: Ensure the web server (Nginx/Apache) is configured to use HTTP/2. This allows multiple requests (like loading icons, scripts, and API calls) to be multiplexed over a single connection, drastically reducing latency.
*   **Cache-Control Headers**: Ensure the PHP `SourceManager` sends aggressive `Cache-Control` headers (e.g., `immutable` or long `max-age`) for the generated `min.js` and `min.css` files so the browser doesn't re-validate them on every page load.

## 4. Server-Side Optimization

Analysis of `common.php` shows that the application scans the `components`, `libraries`, and `plugins` directories on *every* request (AJAX or Page Load).

**Recommendation:**
*   **OpCache**: Ensure PHP OpCache is enabled.
*   **Metadata Caching**: Cache the list of installed components and plugins (e.g., in a simple JSON file or APCu) so the server doesn't have to hit the disk to scan directories for every single API call.

## Implementation Priority

1.  **Batch File Open/Check**: This will provide the most noticeable immediate improvement for the specific symptom of "slow file opening."
2.  **Session Locking Fix**: This involves a small code change in the backend `common.php` or `controller.php` but yields high returns for concurrency.
3.  **File Tree Caching**: This requires more JavaScript work but significantly improves the "browsing" experience.
