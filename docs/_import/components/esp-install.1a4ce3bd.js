import { md5 } from "../../_npm/js-md5@0.8.3/2eae20c2.js";
import { ESPLoader, Transport } from "../../_npm/esptool-js@0.5.6/7c7adb5b.js";
import { bins } from "./bins.cea5d2d2.js";
import { t2pt } from "./t2pt.630cedce.js";
import { Terminal } from "../../_npm/@xterm/xterm@5.5.0/77fabc1a.js";
import { FitAddon } from "../../_npm/@xterm/addon-fit@0.10.0/1861e560.js";
import { ClipboardAddon } from "../../_npm/@xterm/addon-clipboard@0.1.0/87a517fc.js";
// import { skins2bin } from './skin-editor.js';

const ui8ToBstr = (t) => {
  let e = '';
  for (let s = 0; s < t.length; s++)
    e += String.fromCharCode(t[s]);
  return e;
};

const state = {
  change: () => {}
};

export async function onEspConnectClick (xterm) {

  // esp32c6
  const filters = [{usbVendorId: 0x303a, usbProductId: 0x1001}];

  const port = await navigator.serial.requestPort({filters});
  const baudrate = [115200, 460800, 921600][1];
  // await port.open({baudRate});
  const transport = new Transport(port, true);
  const flashOptions = {transport, baudrate, terminal: xterm.callbacks};
  // debugLogging: debugLogging.checked,

  const esploader = new ESPLoader(flashOptions);
  const chip = await esploader.main();
  const progbar = (val) => {
    console.log(val);
  };
  const ret = {port, transport, chip, esploader, progbar, xterm, terminal: xterm.callbacks};
  console.log(ret);
  return ret;
}

export async function onResetClick (esp) {
  const { transport, xterm } = esp;
  if (transport) {
    await transport.setDTR(false);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await transport.setDTR(true);

    const writer = transport.device.writable.getWriter();

    xterm.term.onData((data) => {
      writer.write(new TextEncoder().encode(data));
    });

    while (true) {
      const readLoop = transport.rawRead();
      const { value, done } = await readLoop.next();
      if (done || !value) {
        break;
      }
      xterm.term.write(value);
    }
  }
}

// erase button?
// disconnectButton
// consoleStartButton

const partTable = [ // ESP-IDF Partition Table
  // name: partition_table, offset: 0x8000, size: 0x1000 (1 flash sector)
  //      v--------------v
  {name: 'nvs',       type: 'data.nvs',       offset: 0x9000,   size: 0x6000},
  {name: 'phy_init',  type: 'data.phy',       offset: 0xf000,   size: 0x1000},
  {name: 'factory',   type: 'app.factory',    offset: 0x10000,  size: 0x100000},
  {name: 'config',    type: 'data.undefined', offset: 0x110000, size: 0x2000},
  {name: 'assets',    type: 'data.undefined', offset: 0x112000, size: 0x100000}
];

const cfg2ui8 = (cfg) => {
  const totalLength = partTable.find((e) => e.name === 'config').size;
  const res = new ArrayBuffer(totalLength); // All Zeros
  const resU8 = new Uint8Array(res);

  const ssid = cfg?.ssid || '';

  for (let i = 0; i < ssid.length; i++) {
    resU8[i] = ssid.charCodeAt(i);
  }
  const password = cfg?.password || '';
  for (let i = 0; i < password.length; i++) {
    resU8[32 + i] = password.charCodeAt(i);
  }
  console.log(ssid, password, resU8);
  return resU8;
};

export async function onProgramClick (esp, cfg) {
  const { esploader, transport, terminal } = esp;
  const fileArray = [
    {
      address: 0x8000,
      data: ui8ToBstr(await t2pt(partTable, (val) => new Uint8Array(md5.arrayBuffer(val))
      ))
    },
    ...bins.map(e => ({
      address: e.address,
      data: atob(e.data)
    })),
    {
      address: partTable.find((e) => e.name === 'config').offset,
      data: ui8ToBstr(cfg2ui8(cfg))
    }
  ];
  const flashOptions = {
    fileArray: fileArray,
    flashSize: 'keep',
    eraseAll: cfg?.eraseAll,
    compress: true,
    reportProgress: (fileIndex, written, total) => {
      console.log({fileIndex, written, total});
      state.change({fileIndex, written, total});
    },
    // calculateMD5Hash: md5
    // CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image))
  };
  await esploader.writeFlash(flashOptions);
  await esploader.after();
  console.log('done programming');
  while (true) {
    const readLoop = transport.rawRead();
    const { value, done } = await readLoop.next();

    if (done || !value) {
      break;
    }
    terminal.write(value);
  }
}

const prepareAssets = (skins) => {

  const leftSkins  = skins.filter((skin) => !skin.right);
  const rightSkins = skins.filter((skin) =>  skin.right);

  const headerLength = 1024;
  const heapLength = (leftSkins.length + rightSkins.length) * 4;
  const skinsLength = skins.reduce((res, skin) => res + skin.array.length, 0);

  const totalLength = headerLength + heapLength + skinsLength;
  const res = new ArrayBuffer(totalLength);
  const resU8 = new Uint8Array(res);
  const resU32 = new Uint32Array(res);

  let heap = headerLength;
  let skinHeap = headerLength + heapLength;

  const copySkin = (skin, idx) => {
    console.log(skin);
    const arr = skin.array;
    resU8.set(arr, skinHeap);
    resU32[heap / 4] = skinHeap;
    heap += 4;
    skinHeap += arr.length;
  };

  // fill the header
  resU32[0] = leftSkins.length;
  resU32[1] = heap;
  leftSkins.map(copySkin);

  resU32[2] = rightSkins.length;
  resU32[3] = heap;
  rightSkins.map(copySkin);

  console.log(resU8);
  return resU8;
};

export async function onSkinProgramClick (esp, skins) {
  const { esploader, transport, terminal } = esp;
  const allSkins = prepareAssets(skins);
  const fileArray = [{
    address: partTable.find((e) => e.name === 'assets').offset,
    data: ui8ToBstr(allSkins)
  }];
  const flashOptions = {
    fileArray: fileArray,
    flashSize: 'keep',
    eraseAll: false,
    compress: true,
    reportProgress: (fileIndex, written, total) => {
      console.log({fileIndex, written, total});
      state.change({fileIndex, written, total});
    },
    // calculateMD5Hash: md5
    // CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image))
  };
  await esploader.writeFlash(flashOptions);
  await esploader.after();
  console.log('done programming');
  while (true) {
    const readLoop = transport.rawRead();
    const { value, done } = await readLoop.next();

    if (done || !value) {
      break;
    }
    terminal.write(value);
  }
}

export function onProgressBar (change) {
  state.change = change;
  return () => { state.change = () => {}; };
}

export const xterm = () => {
  const term = new Terminal({
    rows: 30,
    cols: 120,
    cursorBlink: true,
    cursorStyle: 'block',
    fontFamily: 'Iosevka Drom Web',
    // theme: {
    //   // // foreground: '#fff',
    //   // background: '#000',
    //   cursorColor: '#3a4d53',
    //   selectionBackground: '#cfcebe',
    //   black: '#e9e4d0',
    //   red: '#d2212d',
    //   green: '#489100',
    //   yellow: '#ad8900',
    //   blue: '#0072d4',
    //   purple: '#ca4898',
    //   cyan: '#009c8f',
    //   white: '#909995',
    //   brightBlack: '#cfcebe',
    //   brightRed: '#cc1729',
    //   brightGreen: '#428b00',
    //   brightYellow: '#a78300',
    //   brightBlue: '#006dce',
    //   brightPurple: '#c44392',
    //   brightCyan: '#00978a',
    //   brightWhite: '#3a4d53',
    //   cursor: '#3a4d53'
    // }
  });
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  const clipboardAddon = new ClipboardAddon();
  term.loadAddon(clipboardAddon);
  const div = document.createElement('div');
  term.open(div);
  window.addEventListener('resize', () => {
    fitAddon.fit();
  });
  return {
    div,
    term,
    callbacks: {
      clean: () => {
        fitAddon.fit();
        term.clear();
      },
      writeLine: (data) => {
        term.writeln(data);
      },
      write: (data) =>{
        term.write(data);
      }
    }
  };
};

/* eslint-env browser */

