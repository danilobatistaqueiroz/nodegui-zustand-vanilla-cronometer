import { cronometerStore } from "./store";
import { QApplication, QMainWindow, QWidget, QLabel, QPushButton, QIcon, QBoxLayout, ToolButtonPopupMode, QToolButton, Direction, ToolButtonStyle, QMenu, QAction, WidgetEventTypes, QMouseEvent, MouseButton } from '@nodegui/nodegui';
import * as path from "node:path";
import sourceMapSupport from 'source-map-support';

const themes = require('../assets/themes.json')

sourceMapSupport.install();

function main(): void {

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

  function getFormatedDisplay(pelapsed:number=0,value:string="01/01/2025 00:00:00"){
    let time = new Date(value);
    time.setSeconds(time.getSeconds() + pelapsed);
    let formatedTime = time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: 'h23'
    });
    return formatedTime;
  }

  cronometerStore.subscribe((state: any) => state.elapsed, (elapsed) => {
    display.setText(getFormatedDisplay(elapsed));
    if(elapsed==0){
      resetStartStop(btStartStop)
      display.setText(getFormatedDisplay())
    }
  });

  let controles = {descricao:"", comando: ()=>{}};
  cronometerStore.subscribe((state: any) => state.intervaloId, (intervaloId) => {
    controles = intervaloId
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
  });

  const win = new QMainWindow();
  win.setWindowTitle("Cronometro");
  win.setWindowIcon(new QIcon(path.join(__dirname, '../assets/logo-clock.png')));

  const centralWidget = new QWidget();

  const rootLayout = new QBoxLayout(Direction.TopToBottom);
  centralWidget.setObjectName("wgtRoot");
  centralWidget.setLayout(rootLayout);

  const tbThemes = new QToolButton()
  tbThemes.setPopupMode(ToolButtonPopupMode.MenuButtonPopup)
  tbThemes.setToolButtonStyle(ToolButtonStyle.ToolButtonFollowStyle)
  const menu = new QMenu(tbThemes);
  tbThemes.setMenu(menu);

  themes.forEach((t)=>{
    const menuAction = new QAction();
    menuAction.setText(t.theme);
    menuAction.addEventListener("triggered", () => {
      cronometerStore.getState().setTheme({...t})
      tbThemes.setText(t.theme);
      win.setStyleSheet(
        setStyles(t.fontColor,t.backgroundColor,t.displayFontColor)
      );
    });
    menu.addAction(menuAction);
  });

  let theme = cronometerStore.getState().selectedTheme;
  tbThemes.setText(theme.theme)

  tbThemes.setObjectName("tbThemes");

  const display = new QLabel();
  display.setObjectName("display");
  
  display.addEventListener(WidgetEventTypes.MouseButtonPress, (e:any) => {
    const mouseEvt = new QMouseEvent(e);
    if(mouseEvt.button()==MouseButton.RightButton){
      cronometerStore.getState().setElapsed(0);
    }
  })
  display.addEventListener(WidgetEventTypes.MouseButtonDblClick, () => {
    let elapsed = cronometerStore.getState().elapsed;
    cronometerStore.getState().setElapsed(elapsed+(60*60))
  })
  display.setText(getFormatedDisplay(cronometerStore.getState().elapsed));

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

  const screen = QApplication.primaryScreen().geometry();
  const x = screen.width()-300;
  const y = screen.height()-300;
  win.move(x/2,y/2);
  
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
