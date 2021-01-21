# html-metadata-to-csv
Create a CSV file by retrieving meta information from the html file of a static site in the local environment.

# Installation
Clone this repository
```bash
git clone https://github.com/thashimoto123/html-metadata-to-csv.git && cd html-metadata-to-csv
```
Create symlink a package folder
```bash
npm link
```

# Usage
```bash
html-metadata-to-csv
```
## Output
| -- | -- |


# Option
```
  -V, --version                    output the version number
  -t, --target <dir>               Specify target directory (default: "./")
  -d, --dist <filename>            Specify dist file name (default:
                                   "./metadata.csv")
  -e, --extention <extentions...>  Specify the extension of the target file.
                                   (default: ["html","xhtml"])
  -h, --help                       display help for command
```
