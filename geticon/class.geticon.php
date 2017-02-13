<?php
ini_set("error_reporting","E_ALL & ~E_NOTICE"); 
class geticon {

    private $_url = '';
    private $_default = ''; // default icon
    private $_cache_file = '';
    private $_ico_url = '';
    private $_logdata;

    /**
     *
     * @param type $url
     * @param type $root
     * @param type $cache_folder 
     */
    public function __construct($url, $root, $cache_folder) {
        $this->_default = $root . $cache_folder . 'default.ico';
        $url = trim(str_replace(array('http://', 'https://', 'http:/', 'https:/'), '', trim($url)), '/');
        $url = parse_url('http://' . $url);
        $url['host'] = str_replace('www.', '', $url['host']);
        $this->_url = 'http://' . $url['host'] . '/';
        $this->_cache_file = $root . $cache_folder . str_replace(array('.', '/'), '-', $url['host']) . '.ico';
        if (!($this->cache = is_file($this->_cache_file)) || (isset($_REQUEST['cache']) && !$_REQUEST['cache'])) {
            $this->_catch();
            $this->_copy();
        }
    }

    /**
     * catching favicon link
     * 
     * @param boolean $linktag 
     */
    private function _catch($linktag = true) {
        if ($this->_url) {
            if ($linktag) {
                $h = @fopen($this->_url, 'r');
                if ($h) {
                    $html = file_get_contents($this->_url);
                    if (preg_match('/<([^>]*)link([^>]*)rel\=("|\')?(icon|shortcut icon)("|\')?([^>]*)>/iU', $html, $out)) {
                        if (preg_match('/href([s]*)=([s]*)"([^"]*)"/iU', $out[0], $out)) {
                            $ico_href = trim($out[3]);
                            if (preg_match('/(http)(s)?(:\/\/)/', $ico_href, $matches, PREG_OFFSET_CAPTURE)) {
                                $this->_ico_url = $ico_href;
                            } elseif (preg_match('/(\/\/)/', $ico_href, $matches, PREG_OFFSET_CAPTURE)) {
                                $this->_ico_url = 'http:' . $ico_href;
                            } else
                                $this->_ico_url = $this->_url . '/' . ltrim($ico_href, '/');
                        }
                    } 
                }
                $this->_ico_url = $this->_ico_url ? $this->_ico_url : $this->_url . 'favicon.ico';
            } else{
                $this->_ico_url = $this->_url . 'favicon.ico';
            }
            
            $headers = @get_headers($this->_ico_url, 1);
            if ($headers['Location']) {
                $headers['Location'] = is_array($headers['Location']) ? end($headers['Location']) : $headers['Location'];
                $this->_ico_url = $headers['Location'];
                $headers = @get_headers($this->_ico_url, 1);
            }
            if (preg_match('/(200 OK)|(302 Found)/', $headers[0], $matches, PREG_OFFSET_CAPTURE)) {
            } else {
                if ($this->_ico_url != $this->_url . 'favicon.ico' && $linktag) {
                    $this->_catch(false);
                } else {
                    $this->_ico_url = $this->_default;
                }
            }
        }
    }

    /**
     * copying favicon file
     */
    private function _copy() {
        if ($this->_ico_url == $this->_default) {
            //copy($this->_default, $this->_cache_file);
            $this->_cache_file = $this->_default;
        } else{
            $icofile = $this->_cache_file;
        }
        try {
            if($icofile != null){
                file_put_contents($icofile, file_get_contents($this->_ico_url));
            }
        } catch (Exception $e) {
            //copy($this->_default, $icofile);
            $this->_cache_file = $this->_default;
        }
    }
    
    public function getIco(){
        return $this->_cache_file;
    }

    public function getIcoUrl(){
        return $this->_ico_url;
    }
}