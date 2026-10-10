// 구글 글꼴 요청을 내려받아 둔 Do Hyeon / Gowun Dodum 으로 돌려줌 (화면 점검을 실제와 같게)
module.exports = async function fontRoutes(ctx) {
  const H = { 'Access-Control-Allow-Origin': '*' };
  await ctx.route('https://fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', headers: H, body: '@font-face{font-family:"Do Hyeon";src:url(https://fonts.gstatic.com/local/dohyeon.ttf) format("truetype");font-display:block}@font-face{font-family:"Gowun Dodum";src:url(https://fonts.gstatic.com/local/gowun.ttf) format("truetype");font-display:block}' }));
  await ctx.route('https://fonts.gstatic.com/local/dohyeon.ttf', r => r.fulfill({ path: __dirname + '/gfonts/ofl/dohyeon/DoHyeon-Regular.ttf', contentType: 'font/ttf', headers: H }));
  await ctx.route('https://fonts.gstatic.com/local/gowun.ttf', r => r.fulfill({ path: __dirname + '/gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', contentType: 'font/ttf', headers: H }));
};
