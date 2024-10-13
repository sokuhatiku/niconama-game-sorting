# niconama-game-sorting

カプセル魚くんを左右に振り分けるゲームです。時間内に多く処理し、精度が高いほどいいスコアが出ます。

## セットアップ方法
このリポジトリのセットアップには以下の手順に従ってください。

### 素材を配置する
再配布周りの制約があるため素材そのものはリポジトリに含んでおりません。構築する際は以下の配布先よりローカルにダウンロードし、Akashic Engineの仕様に則って`m4a`および`ogg`ファイルを作成してください。

ファイル名|素材名|著作権者|配布場所
:-|:-|:-|:-
`audio/bgm`|じかんがない|(C)PANICPUMPKIN|https://pansound.com/panicpumpkin/music/tanoshii.html
`audio/whistle`|【効果音・SE】ホイッスル|MORIO|https://commons.nicovideo.jp/works/agreement/nc82160

詳細は[Akashic Engineのサウンド仕様のドキュメント](https://akashic-games.github.io/tutorial/v3/audio.html)を参照してください

### コマンドを実行する

開発には`npm`が必要です。
まずは以下のコマンドで依存パッケージをインストールしてください。
```
npm i
```

その後、開発を開始するには以下のコマンドを実行してください。
これにより、ファイルの変更を検知し、自動的にビルドやアセットのリストアップを行うサービスが実行されます。
```
npm run develop
```