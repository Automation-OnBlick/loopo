const {app, BrowserWindow, Menu, Tray} = require('electron');
const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');
const { autoUpdater } = require("electron-updater");
const log = require('electron-log');
const sudo = require('sudo-prompt');
const { dialog } = require('electron');
const { powerSaveBlocker } = require('electron');


app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath('exe')
});
const options = {
  type: 'question',
  buttons: ['Okay'],
  defaultId: 1,
  title: 'Loopo',
  message: 'An instance of the app is already running.',
};

const id = powerSaveBlocker.start('prevent-app-suspension');
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    dialog.showMessageBox(null, options, (response) => {
      console.log(response);
    });
  });
}




function powershellCall(){

      //powershell
      let apploc = app.getPath("userData");
      let  appInstallDir= app.getAppPath();
      let appUpdateLoc = apploc.replace("Roaming", "Local");
      let appInstallDirReg = appInstallDir.replace(/\\resources\\app/g, "");
      appUpdateLoc = appUpdateLoc+'-updater';

      var options = {
        name : 'Loopo'
      };

      sudo.exec('powershell.exe Add-MpPreference -ExclusionPath "'+apploc+'";powershell.exe Add-MpPreference -ExclusionPath "'+appUpdateLoc+'";powershell.exe Add-MpPreference -ExclusionPath "'+appInstallDirReg+'"', options, 
      function(error,stdout,stderr){
        if(error)throw error;
          console.log('stdout : ' + stdout);
      })
      // end powershell
      }




var statusPulse;
var updateCheck = true;


var notFirst = true;
const iconLocation = path.join(__dirname, '/icons/icon.ico');
var usernameError;
var passwordError;
var userID;
var tinyWindow;
var longRandomNumber;
var tray;
var newWindow;





function appReadyCall(randomVariable){
  BrowserWindow.addExtension(__dirname+'/Clientliker').then((name) => console.log(`Added Extension:  ${name}`)).catch((err) => console.log('An error occurred: ', err));
  setTimeout(() =>{
    linkedIn();
  },randomVariable); // changes made
}

function firstLaunch() {
  fs.writeFileSync(app.getPath('userData')+'/firstLaunch.conf', 'config_data_launch_first:true');
}



function generateUserId(){
  fs.readdir(app.getPath('userData') + '/applicationData/', (error) => {
    if (error) {
      console.log(error);
      fs.mkdir(app.getPath('userData') + '/applicationData/', (error) => {
          if (!error) {
            fs.writeFileSync(app.getPath('userData')+'/applicationData/user.joel', randomString(32));
          }
      });
    }
  });
}
//localStorage of linkCollection

function appendToLinkCollection(linksToAppend, currentWindow){
    //add single link to array code here 
    fs.readFile(app.getPath('userData')+'/applicationData/linkCol.json', (error,data) =>{
      if(!error){
        if(data == null || data == '' || !data){
          fs.writeFileSync(app.getPath('userData')+'/applicationData/linkCol.json', '["'+linksToAppend+'"]');
          currentWindow.webContents.executeJavaScript('localStorage.removeItem("linkToAppend")');
        }else if(data != null || data != '' || data ){
          var tempArray = [];
          var tempData = [];
          tempData = JSON.parse(data);
          // console.log(tempData);
          tempData.forEach(element => {
              tempArray.push('"'+element+'"');
          });
          tempArray.push('"'+linksToAppend+'"');
          // console.log(tempArray);
          fs.writeFileSync(app.getPath('userData')+'/applicationData/linkCol.json', '['+tempArray+']');
          currentWindow.webContents.executeJavaScript('localStorage.removeItem("linkToAppend")');
        }
      }
    });
}


function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
function longRandom(){
  var max = 80000;
  var min = 10000;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function cycleRandom(){
  return Math.floor(Math.random() * (10800000 - 7200000 + 1) + 7200000);
}
function encodeItem(text) {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};
function decodeItem(cypher){
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(cypher));
}
  function userCreds(){
    const credsWindow = new BrowserWindow({
      webPreferences:{
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration : true,
        enableRemoteModule: true,
        allowRunningInsecureContent: true
      }
    });
    credsWindow.webContents.executeJavaScript('localStorage.setItem("am-I-Idle?", "0")');
    credsWindow.setMenuBarVisibility(false);
    credsWindow.loadFile('index.html');

    fs.unlink(app.getPath('userData') + '/firstLaunch.conf', function(error){
      if(error){}
      console.log(error);
    });
    
  }
  function linkedIn(){
    var cypherUser;
    var cypherPass;
    var decryptedUser;
    var decryptedPass;
    fs.readFile(app.getPath('userData') + '/applicationData/me.joel','utf-8', (error, data) =>{
      if(error){
        console.log(error);
      }else{
        var cyperData = data.split('   ', 2);
        cypherUser = cyperData[0];
        cypherPass = cyperData[1];
        decryptedUser = decodeItem(cypherUser);
        decryptedPass = decodeItem(cypherPass);

         newWindow = new BrowserWindow({icon: iconLocation,skipTaskbar: true,show:false,
          webPreferences:{
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration : true,
            enableRemoteModule: true,
            allowRunningInsecureContent: true
            
          } 
        });
        newWindow.webContents.executeJavaScript('localStorage.setItem("am-I-Idle?", "0")');
        fs.readFile(app.getPath('userData') + '/applicationData/linkCol.json','utf-8', (error, data) =>{
          if(error || data == '' || !data){
            fs.writeFileSync(app.getPath('userData')+'/applicationData/linkCol.json', '');
          }else{
            newWindow.webContents.executeJavaScript('localStorage.setItem("likedPosts",JSON.stringify('+data+'))',true);
          }
        });
        newWindow.webContents.executeJavaScript('localStorage.setItem("linkedinUsername", "'+decryptedUser+'")', true);
        newWindow.webContents.executeJavaScript('localStorage.setItem("linkedinPassword", "'+decryptedPass+'")', true);
        newWindow.webContents.executeJavaScript('localStorage.setItem("userID", "'+userID+'")', true);
        setTimeout(()=>{
          newWindow.loadURL("https://www.linkedin.com/login");
        },10000);
        var checkCreds = setInterval(()=>{
          newWindow.webContents.executeJavaScript('localStorage.getItem("username-error")', true).then(data =>{
            usernameError = data;
          });
          newWindow.webContents.executeJavaScript('localStorage.getItem("password-error")', true).then(data =>{
            passwordError = data;
          });
        },2000);

        var checkError = setInterval(()=>{
          if(usernameError != null || passwordError != null || newWindow.webContents.getURL().search(/https\:\/\/www\.linkedin\.com\/checkpoint\/challenge\/.*/g) == 0){
            newWindow.webContents.executeJavaScript('localStorage.removeItem("username-error")', true);
            newWindow.webContents.executeJavaScript('localStorage.removeItem("password-error")', true);
            var checkPassInterval = setInterval(() => {
                if(usernameError == '404'){
                  clearInterval(checkError);
                  clearInterval(checkCreds);
                  tinyWindow.loadFile('error.html');
                  tinyWindow.webContents.executeJavaScript('localStorage.setItem("error", "Email Error")');
                  setTimeout(()=>{
                    tinyWindow.hide();
                  },10000);
                  fs.unlink(app.getPath('userData') + '/applicationData/me.joel', function(error){
                      newWindow.webContents.executeJavaScript('localStorage.removeItem("username-error")', true);
                      clearInterval(checkPassInterval);

                      fs.unlink(app.getPath('userData') + '/firstLaunch.conf', function(error){
                        if(error){}
                        console.log(error);
                      });

                      newWindow.close();
                      userCreds();
                  });
                }else if(passwordError == '404'){
                  clearInterval(checkError);
                  clearInterval(checkCreds);
                  tinyWindow.loadFile('error.html');
                  tinyWindow.webContents.executeJavaScript('localStorage.setItem("error", "Password Error")');
                  setTimeout(()=>{
                    tinyWindow.hide();
                  },10000);
                  fs.unlink(app.getPath('userData') + '/applicationData/me.joel', function(error){
                      newWindow.webContents.executeJavaScript('localStorage.removeItem("password-error")', true);
                      clearInterval(checkPassInterval);
                      
                      fs.unlink(app.getPath('userData') + '/firstLaunch.conf', function(error){
                        if(error){}
                        console.log(error);
                      });


                      newWindow.close();
                      userCreds();
                  });
                }else if(newWindow.webContents.getURL().search(/https\:\/\/www\.linkedin\.com\/checkpoint\/challenge\/.*/g) == 0){
                  clearInterval(checkPassInterval);
                    tinyWindow.loadFile('robo.html');
                    setTimeout(()=>{
                      tinyWindow.hide();
                      newWindow.show();

                      var roboCheckReHideCycle = setInterval(()=>{
                        if(newWindow.webContents.getURL() == 'https://www.linkedin.com/feed/'){
                          clearInterval(roboCheckReHideCycle);
                          newWindow.hide();
                        }
                      },1000);
                    },6000);
                }
            },5000);           
          
          }else if(newWindow.webContents.getURL().search(/https\:\/\/www\.linkedin\.com\/check\/add-phone.*/g) == 0 || newWindow.webContents.getURL().search(/https\:\/\/www\.linkedin\.com\/check\/manage\-account/g) == 0){
                  clearInterval(checkPassInterval);
                  clearInterval(checkCreds);
                  newWindow.loadURL('https://www.linkedin.com/feed/');
          }else{
            //Success Condition   
            if(newWindow.webContents.getURL() == 'https://www.linkedin.com/feed/'){
              tinyWindow.loadFile("success.html");
              clearInterval(checkError);
              clearInterval(checkPassInterval);
              clearInterval(checkCreds);
              
              //Timeout Release Since  Successfully Authenticated
                newWindow.webContents.executeJavaScript('localStorage.removeItem("linkedinUsername")', true);
                newWindow.webContents.executeJavaScript('localStorage.removeItem("linkedinPassword")', true);
                setTimeout(()=>{
                  tinyWindow.hide();
                  if(tray){
                    contextMenu = Menu.buildFromTemplate([
                      { label: 'Check Status', click:  function(){
                        tinyWindow.loadFile('success.html');
                        setTimeout(()=>{
                          tinyWindow.show();
                        },800);
                        setTimeout(()=>{
                          tinyWindow.hide();
                        },5000);
                      } },
                      { label: 'Report bug', click:  function(){
                        tinyWindow.loadFile('bugreport.html');
                        setTimeout(()=>{
                        tinyWindow.show();
                        },800);
                      } },
                      { label: 'Logout', click:  function(){
                        var dir = app.getPath('userData') + '/applicationData/me.joel';

                        fs.unlink(app.getPath('userData') + '/firstLaunch.conf', function(error){
                          if(error){}
                          console.log(error);
                        });

                         fs.rmdir(dir, { recursive: true }, (err) => {
                           if (err) {
                               throw err;
                           }
                       });
                       tinyWindow.loadURL("https://www.linkedin.com/m/logout");
                       setTimeout(()=>{
                        tinyWindow.close();
                      },3000);
                       setTimeout(()=>{
                         newWindow.hide();
                       },5000);
                        if(tray){
                          contextMenu = Menu.buildFromTemplate([
                            { label: 'Report bug', click:  function(){
                              tinyWindow.loadFile('bugreport.html');
                              setTimeout(()=>{
                              tinyWindow.show();
                              },800);
                            } },
                            { label: 'Quit', click:  function(){

                              //remove checker here
                                fs.unlink(app.getPath('userData') + '/firstLaunch.conf', function(error){
                                  if(error){}
                                  console.log(error);
                                });

                                app.isQuiting = true;
                                powerSaveBlocker.stop(id);
                                app.quit();
                            } }
                          ]);
                          tray.setContextMenu(contextMenu);
                        }
                        tinyWindow.loadFile('logout/logout.html');
                        setTimeout(()=>{
                          tinyWindow.show();
                        },800);
                         } },
                      { label: 'Quit', click:  function(){
                          fs.unlink(app.getPath('userData') + '/firstLaunch.conf', function(error){
                            if(error){}
                            console.log(error);
                          });
                              
                          app.isQuiting = true;
                          powerSaveBlocker.stop(id);
                          app.quit();
                      } }
                    ]);
                    tray.setContextMenu(contextMenu);
                    tray.on("click", ()=>{
                      tinyWindow.loadFile('success.html');
                          setTimeout(()=>{
                            tinyWindow.show();
                          },800);
                          setTimeout(()=>{
                            tinyWindow.hide();
                          },5000);
                  });
                    }
                  },5000);
                var linkCollectionInterval =  setInterval(()=>{
                  newWindow.webContents.executeJavaScript('localStorage.getItem("iHaveLinks")').then( data =>{
                      if(data == 1){
                          newWindow.webContents.executeJavaScript('localStorage.setItem("iHaveLinks", 0)');
                          newWindow.webContents.executeJavaScript('localStorage.getItem("linkToAppend")').then(linkCollectionToAppend =>{
                          appendToLinkCollection(linkCollectionToAppend, newWindow);
                        });
                      }
                    });
                },10000);
                  
                var idleTimeInterval = setInterval(()=>{
                  newWindow.webContents.executeJavaScript('localStorage.getItem("am-I-Idle?")').then(data =>{
                    if(data == 1){
                      clearInterval(linkCollectionInterval);
                      clearInterval(idleTimeInterval);

                        //usable data here
                    setTimeout(()=>{
                      
                      //logout time extended 
                      newWindow.loadURL("https://www.linkedin.com/m/logout");
                      setTimeout(()=>{
                        newWindow.close();  

                        if(statusPulse != null){
                          statusPulse.close();
                        }
                        
                        setTimeout(()=>{app.relaunch();
                          setTimeout(()=>{app.exit();},3000);
                        },3000);
                      },3000);

                      //  createDefaultWindow(); 
                       //win.hide();
                       if(tray){
                        contextMenu = Menu.buildFromTemplate([
                          { label: 'Report bug', click:  function(){
                            tinyWindow.loadFile('bugreport.html');
                            setTimeout(()=>{
                            tinyWindow.show();
                            },800);
                          } },
                          { label: 'Quit', click:  function(){
                              fs.unlink(app.getPath('userData') + '/firstLaunch.conf', function(error){
                                if(error){}
                                console.log(error);
                              });
                              app.isQuiting = true;
                              powerSaveBlocker.stop(id);
                              app.quit();
                          } }
                        ]);
                        tray.setContextMenu(contextMenu);
                      }
                    },cycleRandomVariable = cycleRandom()); //#.7

                    updatedOnce = true;
                    
                    }
                  })
                },24000);
              }
          }
        },5000);

      }
    });
  }
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});
// updater codes
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
let win;

function sendStatusToWindow(text,windowName) {
  log.info(text);
  windowName.webContents.send('message', text);
}
function createDefaultWindow() {
  win = new BrowserWindow({frame:false,height:455,width:300,show:false,
    webPreferences:{
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration : true,
      enableRemoteModule: true,
      allowRunningInsecureContent: true
    }
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);

  if(notFirst == true){
    win.show();
  }
  return win;
}
 
app.whenReady().then(() => {

  fs.readFile(app.getPath('userData') + '/cmdChecker.conf','utf-8', (error, data) =>{
    if(error || data == '' || !data){
      fs.writeFileSync(app.getPath('userData')+'/cmdChecker.conf', 'config_data_launch_first:true');
      powershellCall();
    }else{
      //
    }
  });
                
  fs.readFile(app.getPath('userData') + '/firstLaunch.conf','utf-8', (error, data) =>{
    if(error || data == '' || !data){
      //First Launch Of the Day Checker
        firstLaunch();
      //End First Launch Of the Day Checker
    }else{
      notFirst = false;
    }
  });

  
  setTimeout(()=>{
      if(updateCheck == true){

        updateCheck != updateCheck;

          createDefaultWindow();

        autoUpdater.checkForUpdates();

        autoUpdater.on('checking-for-update', () => {
          sendStatusToWindow('Checking for update...',win);
        });
        autoUpdater.on('update-available', (ev, info) => {
          sendStatusToWindow('Updating',win);
        });
        autoUpdater.on('update-not-available', (ev, info) => {
          setTimeout(()=>{
            win.close();
          },2500);

            fs.readFile(app.getPath('userData') + '/applicationData/user.joel','utf-8', (error, data) =>{
              if(error || data == '' || !data){
                generateUserId();
              }else{
                userID = data;
                
                statusPulse = new BrowserWindow({resizable:false,skipTaskbar: true,show:false,height:10,width:10,
                  webPreferences:{
                    preload: path.join(__dirname, 'preload.js'),
                    nodeIntegration : true,
                    enableRemoteModule: true,
                    allowRunningInsecureContent: true
                  }
                });
                
                statusPulse.webContents.executeJavaScript('localStorage.setItem("applicationID", "'+userID+'")');
                statusPulse.loadFile('status.html');
              }
            });

            
          fs.readFile(app.getPath('userData') + '/applicationData/me.joel','utf-8', (error, data) =>{
            if(error || data == '   ' || !data){
              userCreds();
            }else{    

                

                tinyWindow = new BrowserWindow({resizable:false,frame:true,icon: iconLocation,skipTaskbar: true,alwaysOnTop:true,show:false,
                  webPreferences:{
                    preload: path.join(__dirname, 'preload.js'),
                    nodeIntegration : true,
                    enableRemoteModule: true,
                    allowRunningInsecureContent: true
                  }
                });
                if(notFirst == true){
                  tinyWindow.show();
                }
                if(tray == undefined || !tray || tray == ''){
                  tray = new Tray(iconLocation)
                  var contextMenu = Menu.buildFromTemplate([
                    { label: 'Report bug', click:  function(){
                      tinyWindow.loadFile('bugreport.html');
                      setTimeout(()=>{
                      tinyWindow.show();
                      },800);
                    } },
                    { label: 'Quit', click:  function(){
                        fs.unlink(app.getPath('userData') + '/firstLaunch.conf', function(error){
                          if(error){}
                          console.log(error);
                        });
                        app.isQuiting = true;
                        powerSaveBlocker.stop(id);
                        app.quit();
                    } }
                  ]);
                  tray.setContextMenu(contextMenu);
                }else{
                  console.log('tray already exist');
                }
                tinyWindow.loadURL(`file://${__dirname}/sync.html#v${app.getVersion()}`);
                tinyWindow.setMenuBarVisibility(false);
                longRandomNumber = longRandom();
                tinyWindow.webContents.executeJavaScript('localStorage.setItem("applicationID", "'+userID+'")');
                tinyWindow.webContents.executeJavaScript('localStorage.setItem("thisIsTheRandomTime", '+longRandomNumber+')');
                appReadyCall(longRandomNumber);
              // Minimized Functionality 
              tinyWindow.on('minimize',function(event){
                event.preventDefault();
                tinyWindow.hide();
              });
              tinyWindow.on('close', function (event) {
                if(!app.isQuiting){
                  event.preventDefault();
                  tinyWindow.hide();
                }
                return false;
              });
            }
          });
        });
        autoUpdater.on('error', (ev, err) => {
          sendStatusToWindow('Error in auto-updater',win); // removed error log
        });
        autoUpdater.on('download-progress', (progressObj) => {
          // doesnt need anything cause its better that way.
        });
        autoUpdater.on('update-downloaded', (ev, info) => {
          sendStatusToWindow('Installing',win);
          setTimeout(()=>{
            autoUpdater.quitAndInstall(true, true);
          },4000);
        });
      }
    },4000);
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) credsWindow()
    });
});


//Error - onblick inbetween causing issue -> causing HRtalk to repeat
    // Goes to am_I_idle
    // }else{
    // else if(data != null || data != '' || data){
    //   var tempArray = [];
    //   var tempData = [];
    //   var tempLink = [];
    //   tempData = JSON.parse(data);
    //   tempData.forEach(element => {
    //       tempArray.push(element);
    //   });
    //   tempLink = JSON.parse(linksToAppend);
    //   tempLink.forEach(element2 => {
    //     tempArray.push(element2);
    //   });
    //   fs.writeFileSync(__dirname+'/data/linkCol.json', JSON.stringify(tempArray));
    //   currentWindowData.loadURL("https://www.linkedin.com/m/logout");
    //   currentWindowData.close();
    //     setTimeout(()=>{
    //       appReadyCall();
    //     },cycleRandomVariable = cycleRandom());
      
    // }