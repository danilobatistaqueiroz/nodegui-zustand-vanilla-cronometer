import { cronometerStore } from "./store";
import { QMainWindow, QWidget, QLabel, QPushButton, QIcon, QBoxLayout, ToolButtonPopupMode, QToolButton, ArrowType, Direction, ToolButtonStyle, QMenu, QAction } from '@nodegui/nodegui';
import * as path from "node:path";
import sourceMapSupport from 'source-map-support';

sourceMapSupport.install();

import Storage from "node-storage";

function main(): void {

  var store = new Storage('./storage.json');
  let theme = store.get('theme')

  function resetStartStop(btStartStop:QPushButton){
    btStartStop.setText("Iniciar");
    btStartStop.removeEventListener("clicked",start);
    btStartStop.removeEventListener("clicked",pause);
    btStartStop.removeEventListener("clicked",resume);
    btStartStop.addEventListener("clicked", start);
  }

  const start = () => {
    cronometerStore.getState().start()
  }
  const pause = () => {
    cronometerStore.getState().pause()
  }
  const resume = () => {
    cronometerStore.getState().resume()
  }
  const reset = () => {
    cronometerStore.getState().reset()
  }

  function getFormatedDisplay(elapsed:number=0,value:string="01/01/2025 00:00:00"){
    let time = new Date(value);
    time.setSeconds(time.getSeconds() + elapsed);
    let formatedTime = time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: 'h23'
    });
    return formatedTime;
  }

  cronometerStore.subscribe((state: any) => {
    display.setText(getFormatedDisplay(state.elapsed));
  });

  let controles = {descricao:"", comando: ()=>{}};
  cronometerStore.subscribe((state: any) => {
    controles = state.intervaloId
    ? {
        descricao: "Pausar",
        comando: pause,
      }
    : {
        descricao: "Continuar",
        comando: resume,
      };
      if(btStartStop.text()!=controles.descricao){
        btStartStop.setText(controles.descricao);
        btStartStop.removeEventListener("clicked",start);
        btStartStop.removeEventListener("clicked",pause);
        btStartStop.removeEventListener("clicked",resume);
        btStartStop.addEventListener("clicked", controles.comando);
      }
      if(state.intervaloId==null && state.elapsed==0){
        resetStartStop(btStartStop)
        display.setText(getFormatedDisplay())
      }
  });

  const win = new QMainWindow();
  win.setWindowTitle("Cronometro");
  win.setWindowIcon(new QIcon(path.join(__dirname, '../assets/logox200.png')));

  const centralWidget = new QWidget();

  const rootLayout = new QBoxLayout(Direction.TopToBottom);
  centralWidget.setObjectName("wgtRoot");
  centralWidget.setLayout(rootLayout);

  const tbThemes = new QToolButton()
  tbThemes.setPopupMode(ToolButtonPopupMode.MenuButtonPopup)
  tbThemes.setToolButtonStyle(ToolButtonStyle.ToolButtonFollowStyle)
  const menu = new QMenu(tbThemes);
  tbThemes.setMenu(menu);

  const themes = [
    {theme:"Monokai",backgroundColor:'rgb(5, 7, 24)',fontColor:'rgb(19, 19, 24)',displayFontColor:'rgb(50,50,200)'},
    {theme:"Dracula",backgroundColor:'rgb(80, 4, 33)',fontColor:'rgb(214, 174, 204)',displayFontColor:'rgb(177, 1, 59)'},
    {theme:"Midnight",backgroundColor:'rgb(0, 0, 0)',fontColor:'rgb(11, 11, 80)',displayFontColor:'rgb(1, 1, 196)'},
    {theme:"Light",backgroundColor:'rgb(255,255,255)',fontColor:'rgb(13, 13, 37)',displayFontColor:'rgb(151, 151, 161)'},
    {theme:"Windows",backgroundColor:'rgb(107, 107, 107)',fontColor:'rgb(0, 0, 0)',displayFontColor:'rgb(23, 23, 26)'}
  ]
  themes.forEach((t)=>{
    const menuAction = new QAction();
    menuAction.setText(t.theme);
    menuAction.addEventListener("triggered", () => {
      store.put('theme', {...t});
      tbThemes.setText(t.theme);
      win.setStyleSheet(
        setStyles(t.fontColor,t.backgroundColor,t.displayFontColor)
      );
    });
    menu.addAction(menuAction);
  });
  tbThemes.setText(theme.theme)
  tbThemes.setObjectName("tbThemes");

  const display = new QLabel();
  display.setObjectName("display");
  display.setText(getFormatedDisplay());

  const btStartStop = new QPushButton();
  btStartStop.setObjectName("btStartStop");
  resetStartStop(btStartStop);

  const btReset = new QPushButton();
  btReset.setObjectName("btReset");
  btReset.setText("Reiniciar");
  btReset.addEventListener("clicked", reset);

  rootLayout.addWidget(display);
  rootLayout.addWidget(btStartStop);
  rootLayout.addWidget(btReset);
  rootLayout.addWidget(tbThemes);

  win.setCentralWidget(centralWidget);
  win.setMinimumWidth(300);
  
  function setStyles(fontColor:string,backgroundColor:string,displayFontColor:string): string{
    return `
      #tbThemes {
        color:${fontColor};
      }
      #btStartStop {
        color:${fontColor};
      }
      #btReset {
        color:${fontColor};
      }
      #wgtRoot {
        background-color:${backgroundColor};
        height: '100%';
        align-items: 'center';
        justify-content: 'center';
      }
      #display {
        color: ${displayFontColor};
        font-size: 66px;
        font-weight: bold;
        padding: 1;
      }
    `
  }

  win.setStyleSheet(
    setStyles(theme.fontColor,theme.backgroundColor,theme.displayFontColor)
  );
  win.show();

  (global as any).win = win;
}
main();
