import {javascript} from "../../_npm/@codemirror/lang-javascript@6.2.4/b4353650.js";
import {EditorView, keymap} from "../../_npm/@codemirror/view@6.37.2/9c172c27.js";
import {button, text} from "../../_observablehq/stdlib/inputs.6dd24f34.js";
import {basicSetup} from "../../_npm/codemirror@6.0.1/704c83ba.js";
import {oneDark} from "../../_npm/@codemirror/theme-one-dark@6.1.2/c93f721a.js";
import onml from "../../_npm/onml@2.1.0/577c295a.js";
import fonts from "./fonts.42a050ea.js";

const {cos, sin, PI, round} = Math;

const genVaSkins = (cfgs) => {
  const width = 176;
  const height = 264;
  const mmWidth = 38.192;
  const mmHeigh = 57.288;
  // const cols = 2;
  const rows = 1;
  const nlen = 35 /* mm */ * width / mmWidth;

  const mk1 = ({step, l1, l2, style}) => {
    const marks = [];
    for (let idx = -1; idx <= 1; idx += step) {
      const alpha = -idx * PI / 4;
      marks.push(['line', {
        x1: l1 * cos(alpha), x2: l2 * cos(alpha),
        y1: l1 * sin(alpha), y2: l2 * sin(alpha),
        style: 'fill:none;stroke:#000;stroke-linecap:round;stroke-width:1px;' + style
      }]);
    }
    return marks;
  };

  const bodyMl = ['g', {
    // style: 'text-rendering: geometricPrecision;'

    // style: `font-family: ${Portfolio.name}; font-size: ${Portfolio.h}px;`
    // style: `font-family: ${ApricotXenC.name}; font-size: ${ApricotXenC.h}px;`

    // class: 'noto-sans-hanunoo-regular',
    // style: "font-family:'Poppins';font-weight:500;font-size:16px"
    // style: 'font-family:Saira;font-weight:500;font-size:16px'
    // style: "font-family: 'Noto Sans Hanunoo'; font-weight:500; font-size:18px"
    // style: "font-family: 'Source Serif 4'; font-weight:500; font-size:18px"
    // style: `font-family: ${Pixel12x10Mono.name}; font-size:16px`
    // style: `font-family: ${ark_pixel_10px_monospaced.name}; font-size: 6x;`
    // style: `font-family: ${ark_pixel_12px_monospaced.name}; font-size: 16x;`
    // style: `font-family: '${IosevkaDromWeb.name}'; font-size:25px`
    // style: `font-family: '${IosevkaDromWeb.name}'; font-weight:500; font-size:25px`
    // style: "font-weight:500; font-size:18px"
  }]; //

  cfgs.map((cfg, cidx) => {
    const {fontFamily, fontSize} = cfg;
    const sign = cfg.right ? -1 : 1;
    const marks = ['g', onml.tt(
      cfg.right ? nlen : (width / 2 - nlen),
      height / 2
    )];
    if (cfg.m1) {
      marks.push(...mk1({
        step: 2 / cfg.m1,
        l1: sign * (nlen - 9),
        l2: sign * (nlen - 2),
        style: 'stroke-width:1.5px'
      }));
    }
    if (cfg.m2) {
      marks.push(...mk1({
        step: 2 /  cfg.m2,
        l1: sign * (nlen - 14),
        l2: sign * (nlen - 1),
        style: 'stroke-width:1.5px'
      }));
    }
    if (cfg.m3) {
      marks.push(...mk1({
        step: 2 / cfg.m3,
        l1: sign * (nlen - 15),
        l2: sign * (nlen - 9),
        style: 'stroke-width:4.5px'
      }));
    }
    if (cfg.t1 !== undefined) {
      if (typeof cfg.t1 === 'function') {
        for (const mark of cfg.t1()) {
          let {fontFamily, fontSize} = mark;
          const alpha = (1 - 2 * mark.pos)  * PI / 4;
          marks.push(['text', {
            x: Math.round(sign * (nlen - mark.offset) * cos(alpha)),
            y: Math.round((nlen - mark.offset) * sin(alpha)),
            ...(
              fontSize
                ? {'font-size': fontSize + 'px'}
                : (fontFamily && fonts[fontFamily].h)
                  ? {'font-size': fonts[fontFamily].h + 'px'}
                  : {}
            ),
            ...(fontFamily ? {'font-family': fonts[fontFamily].name} : {}),
            style: 'fill: #000; stroke: none; text-anchor: middle; alignment-baseline: middle;'
          }, mark.label]);
        }
      }
    }
    const ys = [-124, -62, 62, 124];
    if (cfg.labels !== undefined) {
      cfg.labels.map((e, i) => {
        if (e) {
          marks.push(['text', {
            x: sign * (nlen - 60),
            y: ys[i],
            style: 'fill:#000;stroke:none;text-anchor:middle;alignment-baseline:middle'
          }, e]);
        }
      });
    }
    if (cfg.value !== undefined) {
      if (typeof cfg.value === 'object') {
        const {x, y, demo} = cfg.value;
        marks.push(['text', {
         x,
         y
        }, demo])
      }
    }
    // if (cfg.mark) {
    //   [
    //     [ 74,      131], [ 74,      -131],
    //     [ 74 + 87, 131], [ 74 + 87, -131],
    //     [-74,      131], [-74,      -131],
    //     [-74 - 87, 131], [-74 - 87, -131],
    //   ].map(([cx, cy]) => {
    //     marks.push(['circle', {cx, cy, r: 5, style: 'fill:#000'}]);
    //   });
    // }
    const tile = ['g', {
        ...onml.tt(cidx * width / 2),
        ...(
          fontSize
            ? {'font-size': fontSize + 'px'}
            : (fontFamily && fonts[fontFamily].h)
              ? {'font-size': fonts[fontFamily].h + 'px'}
              : {}
        ),
        ...(fontFamily ? {'font-family': fonts[fontFamily].name} : {}),
        'text-rendering': (
          // 'auto' // The browser automatically balances the factors mentioned above.
          // 'optimizeSpeed' // Prioritizes rendering speed over precision and legibility.
          // 'optimizeLegibility' // Prioritizes legibility over rendering speed and precision.
          'geometricPrecision' // Prioritizes geometric precision over rendering speed and legibility.
        ),
      },
      ['rect', {width: width / 2, height, style: (cidx & 1) ? 'fill:#ffe' : 'fill:#eff'}],
      marks
    ];
    bodyMl.push(tile);
  });

/*
        @font-face {
          font-family: ${Pixel12x10Mono.name};
          src: url('data:application/font-${Pixel12x10Mono.type};charset=utf-8;base64,${Pixel12x10Mono.data}')
        }
        @font-face {
          font-family: ${IosevkaDromWeb.name};
          src: url('data:application/font-${IosevkaDromWeb.type};charset=utf-8;base64,${IosevkaDromWeb.data}')
        }
        @font-face {
          font-family: ${ark_pixel_10px_monospaced.name};
          src: url('data:application/font-${ark_pixel_10px_monospaced.type};charset=utf-8;base64,${ark_pixel_10px_monospaced.data}')
        }
        @font-face {
          font-family: ${ark_pixel_12px_monospaced.name};
          src: url('data:application/font-${ark_pixel_12px_monospaced.type};charset=utf-8;base64,${ark_pixel_12px_monospaced.data}')
        }
*/
  const svgMl = onml.gen.svg(width * cfgs.length / 2, height * rows).concat([
    ['defs',
      ['style', {type: 'text/css'}, `
${Object.entries(fonts).map(([key, val]) => `
        @font-face {
          font-family: ${val.name};
          src: url('data:application/font-${val.type};charset=utf-8;base64,${val.data}')
        }
`).join('\n')}
      `]
    ],
    bodyMl
  ]);
  // svgMl[1].class = 'noto-sans-hanunoo-regular';
  const svgString = onml.stringify(svgMl, 2);
  return {name: 'skin2', svg: svgString};

  // await writeFile('./bin/skins.svg', svgString);
};

const svg2canvas = (cnvs, skinSvg) => {
  const tempImg = document.createElement('img');
  // tempImg.width = 176;
  // tempImg.height = 264;
  tempImg.src = 'data:image/svg+xml,' + encodeURIComponent(skinSvg);
  return new Promise((resolve, reject) => {
    tempImg.addEventListener('load', (e) => {
      // root.append(e.target);
      // const sbox = e.target.getBoundingClientRect();
      // console.log(e.target, sbox);
      // console.log(sbox);
      // const cnvs = document.createElement('canvas');
      // root.append(cnvs);
      // cnvs.width = Math.round(sbox.width);
      // cnvs.height = Math.round(sbox.height);
      const bin = new Uint8Array(4096);
      const ctx = cnvs.getContext('2d',{
        antialias: false,
        willReadFrequently: true
      });
      ctx.drawImage(e.target, 88, 264, 88, 264);
      // console.log(cnvs);

      let bits = 0;
      let byteOffset = 0;
      let byteToStore = 0;
      for (let y = 0; y < 264; y++) {
        for (let x = 0; x < 88; x++) {
          const c = ctx.getImageData(x + 88, y + 264, 1, 1).data[1];
          byteToStore = (byteToStore << 1);
          if (c < 128) {
            ctx.fillRect(x * 2, y * 2, 2, 2);
          } else {
            byteToStore |= 1;
            ctx.clearRect(x * 2, y * 2, 2, 2);
          }
          bits += 1;
          if (bits === 8) {
            bin[byteOffset] = byteToStore;
            byteToStore = 0;
            byteOffset += 1;
            bits = 0;
          }

        }
      }
      resolve(bin)
    });
  });
};

export function skins2bin (skinSrcs) {
  console.log(skinSrcs);
}

export function skinEditor({
  value = "",
  style = "background: #282c34; width: calc(100% - 176px); min-height: 528px; float: left;"
} = {}) {

  const [outer, parent, sidepanel, preview] = ['div', 'div', 'div', 'canvas'].map((t) =>
    document.createElement(t));

  // outer.style = "background-color: #fff;";
  sidepanel.style = "background: #eee; width: 176px; float: right"
  // preview.style = "background: #eee; width: 488px; min-height: 264px;"
  preview.width = 176;
  preview.height = 528;
  // preview.style = "image-rendering: pixelated;"
  parent.style = style;

  parent.value = value;

  const run = async () => {
    const srcTxt = String(editor.state.doc);
    const src = eval(srcTxt);
    const skinSvg = genVaSkins(src);
    // console.log(skinSvg.svg);

    const bin = await svg2canvas(preview, skinSvg.svg);
    // console.log(srcTxt, src, skinSvg, cnvs);

    outer.value = {array: bin, right: src[0].right};
    outer.dispatchEvent(new InputEvent("input", {bubbles: true}));
  };

  const editor = new EditorView({
    parent,
    doc: value,
    extensions: [
      basicSetup,
      javascript(),
      oneDark,
      keymap.of([
        {key: "Shift-Enter", preventDefault: true, run},
        {key: "Mod-s", preventDefault: true, run}
      ])
    ]
  });

  parent.addEventListener("input", (event) =>
    event.isTrusted && event.stopImmediatePropagation());

  const runBtn = button([["RUN ⇒", run]]);
  runBtn.style = "padding: 4px;";

  parent.appendChild(runBtn);
  outer.appendChild(parent);
  outer.appendChild(sidepanel);
  sidepanel.appendChild(preview);
  run();

  return outer;
}
