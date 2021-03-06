/**
 * cmd.js
 */
const exec = require('child_process').exec;
const os = require('os');
const uuidV4 = require('uuid/v4');
const colorful = require('../colorful');

const Cmd = (command, args, config, callback) => {

    try {
        var ret = {
            'hostname': os.hostname(),
            'ip': null,
            'output': null,
            'error': null,
            'cost': 0,
        }
        const networkInterfaces = os.networkInterfaces();
        for (ethName in networkInterfaces) {
            for (ethItem of networkInterfaces[ethName]) {
                if (ethItem.family === 'IPv4' && ethItem.internal == false) {
                    ret.ip = ethItem.address;
                    break;
                }
            }
        }

        const execCommand = command + " " + args.join(" ");

        const commandId = config.id;
        const commondStartTime = Date.now();
        const cmd = exec(execCommand, {
            maxBuffer: 1024 * 1024 * 2
        }, (err, stdout, stderr) => {
            ret.cost = Date.now() - commondStartTime;
            if (err) {
                console.error('standard error output:\n' + err);
                ret.error = err.message;
            } else {
                ret.error = stderr;
                ret.output = stdout;
            }
            callback && callback(false, ret);
        });
        var cmdTimeout = null;
        if (config.timeout) {
            cmdTimeout = setTimeout(() => {
                if (cmd.exitCode === null) {
                    cmd.kill();
                    console.warn(`timeout ${config.timeout}ms`);
                }
            }, config.timeout);
        }
        cmd.on('exit', function (code, signal) {
            if (cmdTimeout) {
                clearTimeout(cmdTimeout);
            }
            console.log(`child process eixt ,exit:${code},singal:${signal}, command: ${execCommand}, cost: ${Date.now() - commondStartTime}ms, commondId: ${colorful(commandId, 'info')}`);
        });

        return true;
    } catch (e) {
        callback && callback(e, null);
        return false;
    }


    return true;

};
module.exports = Cmd;