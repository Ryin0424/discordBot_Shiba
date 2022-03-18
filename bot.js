const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./JSON/auth.json');
const prefix = require('./JSON/prefix.json');

//持續執行方法
let nowDoFunction = false;
let DoingCount = 0;
let DoUserID = '';
let DoData = undefined;
let date = false;

// bot 上線
client.login(auth.key);
client.on('ready', () => {
  console.info(`${client.user.tag} login.`);
});

const ownerID = [
  {
    id: '317268543626412032', // 我
    username: '阿陰',
    time: '18:00'
  },
  {
    id: '401644473819332613', // 村
    username: 'Saronven',
    time: '17:30'
  },
  {
    id: '339418235604697089', // ㄕㄩ
    username: 'Gealach',
    time: '17:00'
  },
  {
    id: '393032833137901579', // 維
    username: 'shengwei',
    time: '22:00'
  },
  {
    id: '357168893229269023', // 達
    username: 'pogoo',
    time: '18:00'
  }
]

const angry = [];

client.on('message', msg => {
  // 前置判斷
  try{
    if(!msg.guild) return; // 訊息不含有 guild 元素(來自私訊)，不回應
    if(!msg.member.user) return; // user 元素不存在，不回應
    if(msg.member.user.bot) return; // 消息由機器人發送，不回應
  }
  catch(error){
    console.error(error);
    return;
  }

  //續行方法
  if (nowDoFunction && msg.author.id === DoUserID) {
    nowDoFunction(msg);
    return;
  }
  // 訊息字串分析
  try {
    const cmd = msg.content;
    // FIXME:
    console.log('user', DoUserID);
    console.log(cmd ,msg.author.id);
    // console.log(msg);

    if (nowDoFunction){
      nowDoFunction(msg);
    }
    switch (cmd) {
      case '社畜柴柴幫幫我': // 設定功能
          try {
            if (DoUserID === '') {
              msg.channel.send('汪嗚～有什麼我能效勞的嗎？');
              DoUserID = msg.author.id;
              nowDoFunction = ShibaHlepMe;
            } else {
              console.log('插話仔', msg.author.id);
              angry.push(msg.author.id);
              msg.channel.send('有其他人正在使用中，請稍等');
            }
          } catch (err) {
            console.error('ShibaHlepMeError', err);
          }
          break;
      case '下班時間': // 查訊下班時間
          const targetIndex = ownerID.findIndex( item => {
            return item.id === msg.author.id;
          })
          let alert = ''
          if (targetIndex > -1) {
            getRightTime();
            alert = calcTime(date, formatTargetTime(ownerID[targetIndex].time));
          }else{
            alert = '看起來你還沒有設定下班時間哦'
          }
          msg.reply(alert);
          break;
      case '下班時間列表': // 列表式查看目前的資料
          const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('列表')
            // .setURL('https://discord.js.org/')
            .setAuthor('社畜的忠實好朋友 - 社畜柴柴', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('測試除錯用的啦')
            // .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addField('\u200B', '\u200B')
            // .setImage('https://i.imgur.com/wSTFkRM.png')
            // .setTimestamp()
            for(let i in ownerID){
              let item = ownerID[i];
              embed.addField(item.username, item.time, true)
            }
            // .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
          msg.channel.send(embed);
          break;
      case '現在幾點':
          getRightTime();
          let hour = (date.getUTCHours() + 8 < 10) ? `0${date.getUTCHours()+8}` : date.getUTCHours()+8;
          let minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : date.getMinutes();

          msg.channel.send(`${hour}:${minutes}`);
          break;
      case '柴猜拳':
          nowDoFunction = doMora;
          DoUserID = msg.author.id;
          msg.channel.send('一決勝負吧！');
          break;
      // default: //身份組ID
      //   CheckID(msg, cmd, CheckParty, msg.author.id);
      //   break;
    }
  } catch (err) {
    console.error('OnMessageError', err);
  }

  // 社畜柴柴幫幫我
  function ShibaHlepMe(msg){
    try{
      if (DoUserID === msg.author.id) {
        switch (msg.content) {
          case '設定下班時間':
            nowDoFunction = setGetOffWorkTime;
            const filterList = filterOwnerID();
            if (filterList.length === 0) {
              msg.reply(`好的！請輸入您的下班時間\n（請用二十四小時制，分號請為半形，ex: 18:00)`);
            } else {
              msg.reply(`已存在資料，目前您的下班時間為：${filterList[0].time}。\n若要修改下班時間，請重新輸入\n（請用二十四小時制，分號請為半形，ex: 18:00)`);
            }
            break;
          case '沒事了':
            CloseAllDoingFunction();
            msg.channel.send('OK～那我回去睡搞搞了');
            break;
        }
      } else {
        console.log('插話仔', msg.author.id);
        angry.push(msg.author.id);
        msg.channel.send('有人正找我呢，你憋吵');
      }
    }
    catch(error){
      console.error('ShibaError', error);
    }
  }

  function filterOwnerID(){
    const filterList = ownerID.filter(list => {
      return list.id === msg.author.id
    })
    return filterList
  }

  function setGetOffWorkTime(msg) {
    try {
      switch (DoingCount) {
        case 0:
          DoData = []
          DoData.push(msg.content); // 下班時間
          msg.channel.send(`申請資料如下：\n設定者 <@${msg.author.id}>\n下班時間 - ${DoData[0]}\n\n正確 Y / 錯誤 N`);
          break;
        case 1:
          if (msg.content === 'Y' || msg.content === 'y') {
            msg.channel.send('已確認，輸入資料中...');
            let index = ownerID.findIndex(item => {
              return item.id === msg.author.id
            });
            if (index > -1) {
              ownerID[index] = {
                id: msg.author.id,
                username: msg.author.username,
                time: DoData[0]
              }
            }else{
              ownerID.push({
                id: msg.author.id,
                time: DoData[0]
              })
            }
            msg.channel.send('輸入完畢！');
            CloseAllDoingFunction();
            //與舊資料比對，已有此人資料變進行更新
            // CheckID(msg, null, EditOldUserPower, DoData[0]);
            // GetGas.postUserPower(DoData, function(dataED) {
            //     if (dataED) {
            //         //bot內變數不會更新，手動更新
            //         UserPowerData.unshift({
            //             'userID': DoData[0],
            //             'userName': DoData[1],
            //             'Joins': DoData[2],
            //             'IsAdmin': DoData[3]
            //         });
            //         msg.channel.send('輸入完畢!');
            //     } else {
            //         msg.channel.send('資料輸入失敗，請重新嘗試');
            //     }
            //     CloseAllDoingFunction();
            // });
          } else if (msg.content === 'N' || msg.content === 'n') {
            CloseAllDoingFunction();
            msg.channel.send('已取消操作，請重新下達指令')
          } else {
            DoingCount--;
            msg.channel.send('無法辨識訊息，請輸入Y/N來選擇');
          }
          break;
      }
      if (DoUserID !== '') DoingCount++;
    } catch (err) {
      CloseAllDoingFunction();
      client.channels.fetch(msg.channel.id).then(channel => channel.send('發生意外錯誤，中斷指令行為，請重新下達指令!'))
      console.error('addUserFunctionNowError', err);
    }
  }
  // 將輸入的訊息(下班時間)還原成系統能分析的格式 (ex: 2022-02-22 22:22)
  function formatTargetTime(str) {
    getRightTime();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${str}`
  }

  function timeToString(time) {
    return (Date.parse(time)).valueOf();
  }

  // 計算下班剩餘時間
  function calcTime(now, target) {
    const diff = (timeToString(target) - timeToString(now))
    // 無條件捨去，1000(毫秒) 60(秒) 60(分)
    let hour = Math.trunc(diff / 1000 / 60 / 60);
    let min = Math.trunc(diff / 1000 / 60 - hour * 60);
    return alertText(hour, min);
  }

  function alertText(hour, min) {
    if (hour >= 2) {
      return `社畜還想下班啊！離下班還有 ${hour}小時 ${min}分 呢！`;
    } else if (hour >= 1) {
      return `離下班只剩 ${hour}小時 ${min}分 哦，加油吧社畜！`;
    } else if(hour === 0 && min > 0){
      return `你好像很努力哦，剩下最後的 ${min}分 就下班了呢`
    } else {
      return `社畜你今天已經解脫啦！還是你很想工作啊？想上班我成全你啊`
    }
  }

  function getRightTime(){
    date = new Date();
  }

  // 取得亂數
  // example: x = 3，則得到 0~3(不含3)之間的亂數 (0.1.2)
  function getRandom(x) {
    return Math.floor(Math.random() * x);
  }

  // 柴猜拳
  function doMora(msg) {
    const mora = ['剪刀', '石頭', '布'];
    const botMora = mora[getRandom(3)];
    try {
      switch (DoingCount) {
        case 0:
          if (msg.content !== '剪刀' && msg.content !== '石頭' && msg.content !== '布'){
            msg.channel.send(`欸，我看不懂你在出什麼啦～`)
            DoingCount --;
          }else{
            msg.channel.send(`我出「${botMora}」！`)
            if (botMora === msg.content){
              msg.channel.send(`哎呀，看來我們不分勝負呢～`);
              msg.channel.send(`再來！`);
              DoingCount --;
            } else { // 分出勝負
              moraWinner(botMora, msg.content);
            }
          }
          break;
      }
      if (DoUserID !== '') DoingCount++;
    } catch (err) {
      CloseAllDoingFunction();
      client.channels.fetch(msg.channel.id).then(channel => channel.send('發生意外錯誤，中斷指令行為，請重新下達指令!'))
      console.error('moraError', err);
    }
  }

  // 判斷猜拳勝負
  function moraWinner(bot, player){
    switch (player){
      case '剪刀':
          if(bot === '布'){
            msg.channel.send(`汪嗚～居然是${player}，我輸啦！`);
          } else{
            msg.channel.send(`勝敗乃兵家常事，大俠請重新來過`);
          }
          break;
      case '石頭':
          if (bot === '剪刀') {
            msg.channel.send(`汪嗚～居然是${player}，我輸啦！`);
          } else {
            msg.channel.send(`勝敗乃兵家常事，大俠請重新來過`);
          }
          break;
      case '布':
          if (bot === '石頭') {
            msg.channel.send(`汪嗚～居然是${player}，我輸啦！`);
          } else {
            msg.channel.send(`勝敗乃兵家常事，大俠請重新來過`);
          }
          break;
    }
    CloseAllDoingFunction();
  }

  // 結束所有續行
  function CloseAllDoingFunction(){
    nowDoFunction = false;
    DoingCount = 0;
    DoUserID = '';
    DoData = undefined;
  }

});
