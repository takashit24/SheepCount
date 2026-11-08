/* 画像・音声は相対URLを指定。空文字なら内蔵描画／合成音を使用。 */
const GAME_CONFIG = {
 duration: 60, initialRight: 4,
 stages: [
  {until:20, interval:[2.1,3.0], burst:[1,1], weights:{normal:8,fail:1,escape:1}},
  {until:40, interval:[1.5,2.2], burst:[1,2], weights:{normal:6,fail:2,escape:2}},
  {until:60, interval:[1.2,1.8], burst:[2,4], weights:{normal:5,fail:3,escape:3}}
 ],
 assets:{sheep:'',background:'',jump:'',fail:'',escape:'',results:{exact:'',close:'',miss:''}}
};
if(typeof module!=='undefined') module.exports=GAME_CONFIG;
