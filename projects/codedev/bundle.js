const express = require('express');
const webpack = require('webpack');
const fs = require('fs');
const config = require('./webpack.config');
const router = express.Router();

router.post('/bundle', (req, res) => {
  const tempFilePath = './temp-code.js';
    // 보안: 코드 길이 제한
    if (req.body.code.length > 10000) {
        return res.status(400).send('Code is too long');
    }
    // 사용자로부터 받은 코드를 임시 파일에 저장
    fs.writeFileSync(tempFilePath, req.body.code);
    console.log(req.body.code)
    // Webpack을 사용하여 번들링
    webpack(config, (err, stats) => {
         console.log(stats.toString({ colors: true, chunks: false }));
        if (err) {
            console.error(err);
            return res.status(500).send('Error during bundling');
        }

        if (stats.hasErrors()) {
            console.error('Compilation errors:', stats.compilation.errors);
        }
        if (stats.hasWarnings()) {
            console.warn('Compilation warnings:', stats.compilation.warnings);
        }

        const bundlePath = './dist/bundle.js';
        if (fs.existsSync(bundlePath)) {
            const bundle = fs.readFileSync(bundlePath, 'utf-8');
            // 임시 파일 삭제
            fs.unlinkSync(tempFilePath);
            res.send(bundle);
        } else {
            console.log("error bundle")
            // 임시 파일 삭제
            fs.unlinkSync(tempFilePath);
            res.status(500).send('Bundling failed');
        }
    });
});

module.exports = router;
