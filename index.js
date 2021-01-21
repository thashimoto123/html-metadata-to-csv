#! /usr/bin/env node
const fs = require('fs');
const { JSDOM } = require('jsdom');
const {Parser, transforms: {unwind}} = require('json2csv');
const jconv = require('jconv');
const program = require('commander');

const searchFiles = (targetDir, fileList, extentions) => {
  const _targetDir = new RegExp(".+\/$").test(targetDir) ? targetDir : targetDir + '/';
  const files = fs.readdirSync(_targetDir);
  files.forEach((file) => {
    const isFile = fs.statSync(_targetDir + file).isFile();
    

    let pattern = '.*(';
    extentions.forEach((extention, i) => {
      if (i === extentions.length - 1) {
        pattern += extention 
      } else {
        pattern += extention + '|'
      }
    });
    pattern += ')$';
    const regexp = new RegExp(pattern);

    if (isFile && regexp.test(file)) {
      fileList.push({
        fileName: _targetDir + file
      })
    }

    if (!isFile) {
      searchFiles(_targetDir + file, fileList, extentions);
    }
  })

  return fileList;
}



const getMetaDataList = (fileList) => {
  return fileList.map((file) => {
      return getMetaDataFromFile(file)
  });
}

const getMetaDataFromFile = (file) => {
  const text = fs.readFileSync(file.fileName, 'utf-8');
  const dom = new JSDOM(text);

  const metaDesc = dom.window.document.querySelector("meta[name='description']");
  const metaKeywords = dom.window.document.querySelector("meta[name='keywords']");
  const title = dom.window.document.title ? dom.window.document.title : ''
  const description = metaDesc ? metaDesc.getAttribute('content') : '';
  const keywords = metaKeywords ? metaKeywords.getAttribute('content') : '';

  return {
    fileName: file.fileName,
    title,
    description,
    keywords
  }
}

function getCsv(data, fields, pathes) {
  const transforms = [unwind({
    // paths: pathes,
    blankOut: true,
  })];
  const json2csvParser = new Parser({fields, transforms, withBOM: true});
  const csv = data.length ? json2csvParser.parse(data) : '';
  return (jconv.convert(csv, 'UTF8', 'SJIS'));
}

program
  .version('0.0.1')
  .option('-t, --target <dir>', 'Specify target directory', './')
  .option('-d, --dist <filename>', 'Specify dist file name', './metadata.csv')
  .option('-e, --extention <extentions...>', 'Specify the extension of the target file.', ['html', 'xhtml'])
  .parse(process.argv);

const options = program.opts();

const fields = ['fileName', 'title', 'description', 'keywords'];

console.log(`INFO: Searching for target files...`);

const fileList = searchFiles(options.target, [], options.extention);

console.log(`INFO: ${fileList.length} files found.`);
console.log(`INFO: Getting meta information from target files...`)

const result = getMetaDataList(fileList);

console.log('INFO: Writing meta information to dist file...');

try {
  const csv = getCsv(result, fields);
  const fd = fs.openSync(options.dist, "w");
  fs.writeSync( fd , csv , 0 , csv.length , (err, written, buffer) => {  //  バッファをファイルに書き込む
    if(err){
      throw err
    }
    else {
    }
  });

  console.log('INFO: Finished writing meta information.');

} catch(err) {
  console.error('ERROR: ' + err.message);
}

