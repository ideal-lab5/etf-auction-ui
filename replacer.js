import replace from "replace-in-file";
const options = {
  outOptions: {
    files: "./out/*",
    from: [/src="\//g, /href="\//g],
    to: ['src="', 'href="'],
  },
  chunksOptions: {
    files: "./out/_next/static/chunks/*",
    from: [/\/_next\//g],
    to: ['_next/'],
  }
};


(async function () {
  try {
    const outResults = await replace(options.outOptions);
    const chunksResults = await replace(options.chunksOptions);
    console.log("Replacement results:", outResults);
    console.log("Replacement results:", chunksResults);
  } catch (error) {
    console.error("Error occurred:", error);
  }
})();