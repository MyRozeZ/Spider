/**
 * Created by Z on 2017.1.3 0003.
 */
const superagent = require("superagent");
const cheerio = require('cheerio');
const async = require('async');
const fs = require('fs');

const targetURL = {};    //抓取目标网址
const actions = [];   //待抓取队列
const profileURL = 'http://heart.dxy.cn/tag/news';         //丁香园心血管模块最新资讯地址
const rootPath = 'F:\\WebInf';                                //文件存放根目录
const  path =  rootPath + "\\" + profileURL.split('/').pop();    //文件存放路径
const  cookie = '';

fs.exists(path,exists => {                          //预处理 移除缓存网页
    if(exists){
        let fileTemp = fs.readdirSync(path);
        fileTemp.forEach(f => {
            fs.unlinkSync(path + '\\' + f);       //移除网页文件
        })
        fs.rmdir(path,err => {                  //删除网站目录
            if(err){
                console.log('清除缓存失败'+err);
                return err;
            }else {
                console.log('成功清除缓存');

            }

        });
    }
})

superagent
    .get(profileURL)
    .set('Cookie',cookie)
    .set('Connection', 'keep-alive')
    .end((err,res) => {
    if(err){
        console.log('url请求出错，具体错误为：' + err);
        return err;
    } else {
        let index = 0;   //待抓取队列数组下标
        let $ = cheerio.load(res.text,{decodeEntities:false});

        fs.mkdir(path);          //创建网页存放目录

        $('dl').each((i,elem) => {
            actions[i] = $(elem).find('a').attr('href');
      //      console.log(actions[i]);
        });
        console.log("待抓取队列有"+actions.length+"个网页");

        actions.forEach(e => {
            let cookies = '';
            superagent
                .get(e)
                .set('Connection', 'keep-alive')
                .set('Cookie',cookies)
                .end((err,res) => {
                    if(err){
                        console.log("正在抓取第" + (++index) +"个网页");
                        console.log("网址为" + e);
                        console.log('抓取失败，失败原因为：' + err + '\n' +  res.text);
                        return err;
                    } else {
                        console.log("正在抓取第" + (++index) +"个网页");
                        console.log("网址为" + e);
                        let route = path + '\\' + e.split('/').pop() + '.txt';
                        console.log(route);
                        fs.open(route,'w',(err,fd) => {         //存放抓取网页
                            if(err){
                                console.log('文件打开失败');
                            }else {
                                fs.write(fd,res.text,0,res.text.length,(error,ytesWritten, buffer) => {
                                    if(error){
                                        console.log('写入文件失败');
                                    }else{
                                        console.log('写入文件成功')
                                    }
                                })
                            }

                        });
                    }
                })

        })


    }
})
