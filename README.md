# 純色全螢幕

[black.miniasp.com](https://black.miniasp.com/) 是一個免安裝的繁體中文螢幕工具。點選 **黑色畫面**（`#000000`）看清螢幕灰塵、**白色畫面**（`#FFFFFF`）用螢幕臨時照明，或用 **綠色畫面**（`#00FF00`）當作拍攝背景。

輕點純色畫面或按 **Esc** 返回。若瀏覽器限制原生全螢幕，純色會填滿網頁可用範圍，瀏覽器工具列可能仍然可見。亮度與休眠時間由裝置設定控制。首頁外觀預設跟隨系統，手動選擇會儲存在瀏覽器。

## 本機預覽

網站使用原生 HTML、CSS 與 JavaScript，無須安裝套件或建置。

```sh
python3 -m http.server 8000
```

開啟 [http://localhost:8000/](http://localhost:8000/)。驗證時可在桌面與行動尺寸各開啟三種純色，測試點擊及 Esc 退出、刷新後的主題設定，以及瀏覽器拒絕全螢幕時的畫面。

## 專案結構與部署

- `index.html`、`styles.css`、`screen.js` 分別提供介面、樣式與全螢幕操作。
- `assets/`、`favicon.*` 和 `site.webmanifest` 提供分享圖與裝置圖示。
- GitHub Pages 使用 `main` 分支的根目錄。根目錄的 `CNAME` 指定自訂網域，Cloudflare 以 DNS only 的 CNAME 指向 GitHub Pages 主機。

© 2026 [Will 保哥的技術交流中心](https://www.facebook.com/will.fans/) · [MIT 授權](LICENSE)
