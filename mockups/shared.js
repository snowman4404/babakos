/*
 * Glue for the homepage mockup (mockups/d-pindah-tangan), which lives two folders below the
 * site root. Loaded after ../../js/data.js, ../../js/utils.js and ../../js/layout.js.
 * Everything else (formatting, distances, BBK.initReveal) is reused from the real scripts.
 */
(function () {
  // Real image paths are relative to the site root; from here they need '../../' in front.
  const siteProductImage = BBK.productImage;
  BBK.productImage = (p) => '../../' + siteProductImage(p);

  /** Footer credit line built from the shared BBK.photoCredits. */
  BBK.creditsHTML = () =>
    'Foto contoh dari Wikimedia Commons: ' +
    BBK.photoCredits
      .map(([what, by, url]) => `<a href="${BBK.escape(url)}">${BBK.escape(what)}</a> oleh ${BBK.escape(by)}`)
      .join('; ') + '.';
})();
