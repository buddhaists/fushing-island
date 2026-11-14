# 福星龍浮空島｜《文藝復興》第 18 期

屏東縣屏東市復興國民小學校刊《文藝復興》第 18 期（民國 115 年 6 月 15 日出刊）的 3D 浮空島學習網站。
九座浮空島對應九個主題，孩子讀完每座島的內容、答對闖關題目就能蓋章，集滿九枚印章可以領取「福星龍學習證書」。

## 九座島

| 島 | 主題 | 網址代號 |
|---|---|---|
| 初心啟航島 | 師長的話 | `#/start` |
| 寰宇交會島 | 國際視野 | `#/world` |
| 秘境踏查島 | 家鄉探索 | `#/explore` |
| 溫心守護島 | 感恩家人 | `#/love` |
| 璀璨桂冠島 | 榮耀與肯定 | `#/honor` |
| 奇思妙想島 | 想像創作（二至六年級） | `#/create` |
| 萌芽歡樂島 | 幼兒園與一年級 | `#/sprout` |
| 乘風蛻變島 | 成長與畢業 | `#/grow` |
| 隱形推進島 | 校務與資源 | `#/support` |

## 功能

- **3D 群島**：Vite + Three.js，島嶼與道具全部由程式產生，不需外部模型。電腦、平板、手機自動分級畫質，幀率太低時自動降級。
- **內容卡片**：每張卡片是給孩子讀的白話摘要，可展開「看原文」；照片可放大。
- **闖關**：一座島的卡片全部點開過才出題，四選一，答錯會提示回去看哪一張卡片，可以無限次重答。
- **福星龍**：每座島藏一隻福星龍，找到就收進圖鑑。
- **學習證書**：集滿九枚印章後輸入暱稱，在瀏覽器產生證書圖片並下載。
- **注音**：島名、白話小標與闖關題目可切換注音（課本式直排在字的右邊）。
- **氛圍**：白天、陰天、雨天、黃昏、夜晚、颱風手動切換；音樂與音效預設靜音。

## 隱私與去識別化

- 網站只顯示「年班」，不顯示任何學生姓名；榮譽榜與受獎名單只放統計與團體名稱。
- 照片只選團體照與遠景，並避開頁面上的姓名文字。
- 闖關進度、福星龍與證書暱稱只存在使用者這台裝置的瀏覽器（localStorage），不會上傳。
- 校刊 PDF 與含姓名的原始文字稿**不放進這個 repo**。

## 內容維護

| 檔案 | 內容 |
|---|---|
| `src/data/site.js` | 九座島的名稱、位置、顏色、導覽句、福星龍名字與台詞 |
| `src/data/issues/18/index.js` | 每座島的卡片（摘要、來源頁碼、原文與照片） |
| `src/data/issues/18/pieces.json` | 學生作品與師長文章的原文（已去識別化，由腳本產生） |
| `src/data/issues/18/quiz.js` | 九題闖關題目（第一個選項是正確答案） |
| `src/data/zhuyin.js` | 注音對照表（破音字以詞指定） |
| `public/photos/18/` | 從校刊頁面裁切的照片 |

重新產生原文（需要原始文字稿，作者姓名會自動移除）：

```bash
python scripts/build-issue18.py <文字稿.md> src/data/issues/18/pieces.json
```

重新產生網站圖示與分享圖：

```bash
python scripts/make-icons.py
```

之後要做第 19 期，新增 `src/data/issues/19/` 並換掉照片即可，引擎不用改。

## 執行

```bash
npm install
npm run dev
```

推上 `main` 分支後，GitHub Actions（`.github/workflows/deploy.yml`）會自動建置並發布到 GitHub Pages。

## 來源與授權

- 本專案改寫自阿凱老師的「石門國小品牌群島」（[cagoooo/smes-island](https://github.com/cagoooo/smes-island)），沿用其 3D 引擎，依 MIT 授權保留原著作權聲明（見 `LICENSE`）。
- 內容取自屏東縣復興國民小學《文藝復興》第 18 期；福星龍為復興國小校徽圖像。
- 聲音：音檔都在 `public/audio/`，來自 [Pixabay](https://pixabay.com/)，採 Pixabay Content License。
  - 配樂：白天 The Wind Awakening Memories of the Forest、夜晚 The Floating Garden of Stars (Dreamy Edit)（CHAse9602，上架者標示為 AI 生成）；陰天 Warm Acoustic（AtlasAudio）；雨天 A rainy day（Tomomi_Kato）；黃昏 Sundowners（MonkeyBandito）；颱風環境音 Strong Wind And Thunder Loop（Fletchpike）。
  - 環境音：Gentle Rain 07（DRAGON-STUDIO）、Night cricket ambience、birds in the morning（freesound_community）
  - 音效：floraphonic、Universfield、DRAGON-STUDIO、paulseling、chrisiex1、Soumages、49053354、freesound_community
