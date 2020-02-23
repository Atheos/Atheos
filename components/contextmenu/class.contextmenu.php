<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../lib/diff_match_patch.php');
require_once('../../common.php');

class Contextmenu extends Common
{

    //////////////////////////////////////////////////////////////////
    // PROPERTIES
    //////////////////////////////////////////////////////////////////

    public $root          = "";
    public $project       = "";
    public $rel_path      = "";
    public $path          = "";
    public $patch         = "";
    public $type          = "";
    public $new_name      = "";
    public $content       = "";
    public $destination   = "";
    public $upload        = "";
    public $controller    = "";
    public $upload_json   = "";
    public $search_string = "";

    public $search_file_type = "";
    public $query         = "";
    public $foptions     = "";

    // JSEND Return Contents
    public $status        = "";
    public $data          = "";
    public $message       = "";

    //////////////////////////////////////////////////////////////////
    // METHODS
    //////////////////////////////////////////////////////////////////

    // -----------------------------||----------------------------- //

    //////////////////////////////////////////////////////////////////
    // Construct
    //////////////////////////////////////////////////////////////////

    public function __construct($get, $post, $files)
    {
        $this->rel_path = Filemanager::cleanPath($get['path']);

        if ($this->rel_path!="/") {
            $this->rel_path .= "/";
        }
        if (!empty($get['query'])) {
            $this->query = $get['query'];
        }
        if (!empty($get['options'])) {
            $this->foptions = $get['options'];
        }
        $this->root = $get['root'];
        if ($this->isAbsPath($get['path'])) {
            $this->path = Filemanager::cleanPath($get['path']);
        } else {
            $this->root .= '/';
            $this->path = $this->root . Filemanager::cleanPath($get['path']);
        }
        // Search
        if (!empty($post['search_string'])) {
            $this->search_string = ($post['search_string']);
        }
        if (!empty($post['search_file_type'])) {
            $this->search_file_type = ($post['search_file_type']);
        }
        // Create
        if (!empty($get['type'])) {
            $this->type = $get['type'];
        }
        // Modify\Create
        if (!empty($get['new_name'])) {
            $this->new_name = $get['new_name'];
        }

        foreach (array('content', 'mtime', 'patch') as $key) {
            if (!empty($post[$key])) {
                if (get_magic_quotes_gpc()) {
                    $this->$key = stripslashes($post[$key]);
                } else {
                    $this->$key = $post[$key];
                }
            }
        }
        // Duplicate
        if (!empty($get['destination'])) {
            $get['destination'] = Filemanager::cleanPath($get['destination']);
            if ($this->isAbsPath($get['path'])) {
                $this->destination = $get['destination'];
            } else {
                $this->destination = $this->root . $get['destination'];
            }
        }
    }


    //////////////////////////////////////////////////////////////////
    // DUPLICATE (Creates a duplicate of the object - (cut/copy/paste)
    //////////////////////////////////////////////////////////////////

    public function duplicate()
    {

        if (!file_exists($this->path)) {
            $this->status = "error";
            $this->message = "Invalid Source";
        }

        function recurse_copy($src, $dst)
        {
            $dir = opendir($src);
            @mkdir($dst);
            while (false !== ( $file = readdir($dir))) {
                if (( $file != '.' ) && ( $file != '..' )) {
                    if (is_dir($src . '/' . $file)) {
                        recurse_copy($src . '/' . $file, $dst . '/' . $file);
                    } else {
                        copy($src . '/' . $file, $dst . '/' . $file);
                    }
                }
            }
            closedir($dir);
        }

        if ($this->status!="error") {
            if (is_file($this->path)) {
                copy($this->path, $this->destination);
                $this->status = "success";
            } else {
                recurse_copy($this->path, $this->destination);
                if (!$this->response) {
                    $this->status = "success";
                }
            }
        }

        $this->respond();
    }

    //////////////////////////////////////////////////////////////////
    // UPLOAD (Handles uploads to the specified directory)
    //////////////////////////////////////////////////////////////////

    public function upload()
    {

        // Check that the path is a directory
        if (is_file($this->path)) {
            $this->status = "error";
            $this->message = "Path Not A Directory";
        } else {
            // Handle upload
            $info = array();
            while (list($key,$value) = each($_FILES['upload']['name'])) {
                if (!empty($value)) {
                    $filename = $value;
                    $add = $this->path."/$filename";
                    if (@move_uploaded_file($_FILES['upload']['tmp_name'][$key], $add)) {
                        $info[] = array(
                            "name"=>$value,
                            "size"=>filesize($add),
                            "url"=>$add,
                            "thumbnail_url"=>$add,
                            "delete_url"=>$add,
                            "delete_type"=>"DELETE"
                        );
                    }
                }
            }
            $this->upload_json = json_encode($info);
        }

        $this->respond();
    }

    //////////////////////////////////////////////////////////////////
    // RESPOND (Outputs data in JSON [JSEND] format)
    //////////////////////////////////////////////////////////////////

    public function respond()
    {

        // Success ///////////////////////////////////////////////
        if ($this->status=="success") {
            if ($this->data) {
                $json = '{"status":"success","data":{'.$this->data.'}}';
            } else {
                $json = '{"status":"success","data":null}';
            }

        // Upload JSON ///////////////////////////////////////////
        } elseif ($this->upload_json!='') {
            $json = $this->upload_json;

        // Error /////////////////////////////////////////////////
        } else {
            $json = '{"status":"error","message":"'.$this->message.'"}';
        }

        // Output ////////////////////////////////////////////////
        echo($json);
    }

    //////////////////////////////////////////////////////////////////
    // Clean a path
    //////////////////////////////////////////////////////////////////

    public static function cleanPath($path)
    {
    
        // replace backslash with slash
        $path = str_replace('\\', '/', $path);

        // allow only valid chars in paths$
        $path = preg_replace('/[^A-Za-z0-9\-\._\/]/', '', $path);
        // maybe this is not needed anymore
        // prevent Poison Null Byte injections
        $path = str_replace(chr(0), '', $path);

        // prevent go out of the workspace
        while (strpos($path, '../') !== false) {
            $path = str_replace('../', '', $path);
        }

        return $path;
    }
}
