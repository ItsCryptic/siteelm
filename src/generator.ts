import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'
import jsToHtmlWith from './jstohtml'
import {Config} from './config'
import {compileStaticElmWith, compileDynamicElmWith} from './elmtojs'

/**
 * main function for generating the site
 * @param config
 */ 
const generateAll = (config: Config) => {
    // 1. generate static pages
    const elm = compileStaticElmWith(config)
    const appjs = compileDynamicElmWith(config)
    const contentFiles = 
        glob.sync(`${config.build.contents.src_dir}/**/*`, {ignore: config.build.contents.exclude || [], nodir: true})
    contentFiles.forEach(x => convertAndSave(x, config, elm, appjs))
    // 2. copy static assets
    fs.copySync(config.build.assets.src_dir, config.build.dist_dir)
}

/**
 * create a path for saving
 * @param file path of a content file
 * @param config
 */
const savePathFor = (file: string, config: Config): string => {
    if (file === config.build.contents.index) {
        return path.join(config.build.dist_dir, 'index.html')
    } else {
        const r = path.relative(config.build.contents.src_dir, file) 
        const p = path.parse(r)
        return path.join(config.build.dist_dir, p.dir, p.name, 'index.html')
    }
}

/**
 * convert a content file to a static html and save it 
 * @param file path of a content file
 * @param config
 * @param elmcode a raw javascript code string
 * @param appjs path for the dynamic elm code
 */ 
const convertAndSave = (file: string, config: Config, elmcode: string, appjs: string): void => {
    console.log(`Building: ${file}`)
    const html = jsToHtmlWith(file, elmcode, appjs, config.build.contents.draft || false)
    if(html !== '') {
        const savePath = savePathFor(file, config)
        fs.ensureFileSync(savePath)
        fs.writeFileSync(savePath, html)
    }
}

export default generateAll