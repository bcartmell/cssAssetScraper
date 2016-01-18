CSS Asset Scraper
=================

A simple Node.js script to parse CSS files and download all external resources
by searching for instances of url(...) and saving the resource from that url
into to specified folder.

Called as so:

    node cssAssetScraper/index.js path/to/css/file folder/to/save/files

Paths can be relative to Current Working Directory
