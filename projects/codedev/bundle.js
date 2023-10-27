const express = require('express');
const webpack = require('webpack');
const fs = require('fs');
const config = require('./webpack.config');
const router = express.Router();
const path = require('path');

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
        if (err || stats.hasErrors()) {
            const errorMessage = err ? err.toString() : stats.compilation.errors.toString();
            console.error(errorMessage);

            createErrorLog(errorMessage);

            fs.unlinkSync(tempFilePath);
            return res.status(500).send('Error during bundling');
        }

        if (stats.hasWarnings()) {
            console.warn('Compilation warnings:', stats.compilation.warnings);
        }

        //const bundlePath = './dist/bundle.js';
        const bundlePath = path.resolve(__dirname, './dist/bundle.js');
        if (fs.existsSync(bundlePath)) {
            const bundle = fs.readFileSync(bundlePath, 'utf-8');
            // 임시 파일 삭제
            fs.unlinkSync(tempFilePath);
            res.send(bundle);
        } else {
            createErrorLog("Bundling failed");
            // 임시 파일 삭제
            fs.unlinkSync(tempFilePath);
            res.status(500).send('Bundling failed');
        }
    });
});

// 로그 파일 생성 함수
const createErrorLog = (errorMessage) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');

    const logRoot = "log";
    const folderName = `${year}-${month}-${day}`;
    const logFileName = `${hours}${minutes}${seconds}.log`;

    // 'log' 폴더가 없다면 생성
    if (!fs.existsSync(logRoot)) {
        fs.mkdirSync(logRoot);
    }

    const dateFolderPath = path.join(logRoot, folderName);

    // 날짜별 폴더가 없다면 생성
    if (!fs.existsSync(dateFolderPath)) {
        fs.mkdirSync(dateFolderPath);
    }

    const logFilePath = path.join(dateFolderPath, logFileName);

    fs.writeFileSync(logFilePath, errorMessage);
};


module.exports = router;
