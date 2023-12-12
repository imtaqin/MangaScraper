const cheerio = require("cheerio");
const request = require("request-promise");
const puppeteer = require("puppeteer");
const url = require("../config/url.js");
const axios = require("axios");
let browser;

async function ensureBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({ headless: true });
  }
  return browser;
}


async function PopularTodayHeader() {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const popularTodays = $(
      "#content > div > div.postbody > div.bixbox.hothome > div.listupd > div"
    )
      .map((index, element) => {
        const title = $(element).find(".tt").text();
        const cleanTitle = title.trim();
        const urlRaw = $(element).find("a").attr("href");
        const urls = urlRaw.replace(url, "");
        const img = $(element).find("img").attr("src");
        const lastChapt = $(element).find(".epxs").text();
        const rating = $(element).find(".numscore").text();
        const popular = { cleanTitle, urlRaw, urls, img, lastChapt, rating };

        return popular;
      })
      .get();

    return popularTodays;
  } catch (error) {
    console.error(error);
  }
}

async function PopularTodayDesc(popularWithHeaders) {
  return await Promise.all(
    popularWithHeaders.map(async (popular) => {
      try {
        const response = await axios.get(popular.urlRaw);
        const $ = cheerio.load(response.data);
        popular.description = $(".wd-full > .entry-content").text();
        const list = [];
        $(".mgen")
          .find("a")
          .each((index, element) => {
            var text = $(element).text();
            list.push(text);
          });
        popular.genre = list;
        return popular;
      } catch (error) {
        console.error(error);
      }
    })
  );
}

async function PopularTodays() {
  const popularWithHeaders = await PopularTodayHeader();
  const fullData = await PopularTodayDesc(popularWithHeaders);

  return {
    message: "Success",
    data: fullData,
  };
}

async function latestManga() {
 
  try {
    // Launch a new browser instance
    browser = await puppeteer.launch();

    // Open a new page
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Get the HTML of the page
    const htmlResult = await page.content();

    // Process the HTML with Cheerio
    const $ = cheerio.load(htmlResult);
    const latest = $('.bixbox:eq(2)')
      .find('.utao')
      .map((index, element) => {
        // ... the rest of your Cheerio code for parsing ...
        // No changes are needed in the Cheerio code block
      })
      .get();

    const pageNav = $('.hpage a')
      .map(function () {
        return $(this).attr('href');
      })
      .get();

    // Close the browser
    await browser.close();

    return {
      message: 'Success',
      data: latest,
      paginate: {
        next: pageNav[0],
        prev: pageNav[1],
      },
    };
  } catch (error) {
    console.error(error);
    // Close the browser in case of an error
    if (browser) {
      await browser.close();
    }
    throw error; // Rethrow the error to handle it in the caller function
  }
}

async function LatestMangaHeader() {
  try {
    const htmlResult = await request.get(url);
    const $ = await cheerio.load(htmlResult);

    const latest = $(".bixbox:eq(2)")
      .find(".utao")
      .map((index, element) => {
        const title = $(element).find("h4").text();
        const image = $(element).find("img").attr("src");
        const urlRaw = $(element).find(".series").attr("href");
        const urls = urlRaw.replace(url, "");
        const list = $(element)
          .find(".luf ul li")
          .map((index, element) => {
            const linkRaw = $(element).find("a").attr("href");
            const link = linkRaw.replace(url, "");
            const text = $(element).find("a").text();
            const time = $(element).find("span").text();

            const replaceTime = time
              .replace(/detik lalu/g, "second ago")
              .replace(/menit lalu/g, "minute ago")
              .replace(/jam lalu/g, "hour ago")
              .replace(/hari lalu/g, "day ago")
              .replace(/minggu lalu/g, "week ago")
              .replace(/bulan lalu/g, "month ago")
              .replace(/tahun lalu/g, "year ago");

            return { link, text, replaceTime };
          })
          .get();
        const all = { title, urls, urlRaw, image, list };

        return all;
      })
      .get();

    return latest;
  } catch (error) {
    console.error(err);
  }
}

async function LatestMangaDesc(latestMangaWithHeaders) {
  return await Promise.all(
    latestMangaWithHeaders.map(async (latest) => {
      try {
        const response = await axios.get(latest.urlRaw);
        const $ = cheerio.load(response.data);

        latest.rating = $("div.rating > div > div.num").text();
        latest.type = $(
          "div.thumbook > div.rt > div.tsinfo > div:nth-child(2) > a"
        ).text();
        const list = [];
        $(".mgen")
          .find("a")
          .each((index, element) => {
            var text = $(element).text();
            list.push(text);
          });
        latest.genre = list;

        return latest;
      } catch (error) {
        console.error(error);
      }
    })
  );
}

async function LatestManga() {
  const htmlResult = await request.get(url);
  const $ = await cheerio.load(htmlResult);

  const latestMangaWithHeaders = await LatestMangaHeader();
  const fullData = await LatestMangaDesc(latestMangaWithHeaders);

  const page = $(".hpage a")
    .map(function () {
      return $(this).attr("href");
    })
    .get();

  return {
    message: "Success",
    data: fullData,
    paginate: {
      next: page[0].replace(url, ""),
    },
  };
}

async function LatestMangawithPageHeader(number) {
  try {
    const htmlResult = await request.get(`${url}page/${number}`);
    const $ = await cheerio.load(htmlResult);

    const latest = $(".bixbox:eq(2)")
      .find(".utao")
      .map((index, element) => {
        const title = $(element).find("h4").text();
        const image = $(element).find("img").attr("src");
        const urlRaw = $(element).find(".series").attr("href");
        const urls = urlRaw.replace(url, "");
        const list = $(element)
          .find(".luf ul li")
          .map((index, element) => {
            const linkRaw = $(element).find("a").attr("href");
            const link = linkRaw.replace(url, "");
            const text = $(element).find("a").text();
            const time = $(element).find("span").text();

            const replaceTime = time
              .replace(/detik lalu/g, "second ago")
              .replace(/menit lalu/g, "minute ago")
              .replace(/jam lalu/g, "hour ago")
              .replace(/hari lalu/g, "day ago")
              .replace(/minggu lalu/g, "week ago")
              .replace(/bulan lalu/g, "month ago")
              .replace(/tahun lalu/g, "year ago");

            return { link, text, replaceTime };
          })
          .get();
        const all = { title, urls, urlRaw, image, list };

        return all;
      })
      .get();

    return latest;
  } catch (error) {
    console.error(err);
  }
}

async function LatestMangawithPageDesc(latestMangaWithHeaders) {
  return await Promise.all(
    latestMangaWithHeaders.map(async (latest) => {
      try {
        const response = await axios.get(latest.urlRaw);
        const $ = cheerio.load(response.data);

        latest.rating = $("div.rating > div > div.num").text();
        latest.type = $(
          "div.thumbook > div.rt > div.tsinfo > div:nth-child(2) > a"
        ).text();
        const list = [];
        $(".mgen")
          .find("a")
          .each((index, element) => {
            var text = $(element).text();
            list.push(text);
          });
        latest.genre = list;

        return latest;
      } catch (error) {
        console.error(error);
      }
    })
  );
}

async function LatestMangawithPage(number) {
  const htmlResult = await request.get(`${url}page/${number}`);
  const $ = await cheerio.load(htmlResult);

  const latestMangaWithHeaders = await LatestMangawithPageHeader(number);
  const fullData = await LatestMangawithPageDesc(latestMangaWithHeaders);

  const page = $(".hpage a")
    .map(function () {
      return $(this).attr("href");
    })
    .get();

  const prev = page[0].replace(url, "");
  const next = page[1].replace(url, "");

  return {
    message: "Success",
    data: fullData,
    paginate: {
      prev: prev,
      next: next,
    },
  };
}

async function latestMangawithPage(number) {
  try {
    const htmlResult = await request.get(`${url}page/${number}`);
    const $ = await cheerio.load(htmlResult);

    const latest = $(".bixbox:eq(2)")
      .find(".utao")
      .map((index, element) => {
        const title = $(element).find("h4").text();
        const image = $(element).find("img").attr("src");
        const series = $(element).find(".series").attr("href");
        const list = [];
        $(element)
          .find(".luf ul")
          .each((index, element) => {
            const li = $(element)
              .find("li a")
              .each(function () {
                var href = $(this).attr("href");
                list.push(href);
              });
          });
        return { title, series, image, list };
      })
      .get();

    const page = $(".hpage a")
      .map(function () {
        return $(this).attr("href");
      })
      .get();

    return {
      message: "Success",
      data: latest,
      paginate: {
        next: page[0],
        prev: page[1],
      },
    };
  } catch (error) {
    console.error(err);
  }
}

async function Genre() {
  try {
    const htmlResult = await request.get(url);
    const $ = await cheerio.load(htmlResult);

    const genre = $("#sidebar > div:nth-child(4) > ul > li a")
      .map((index, element) => {
        const url = $(element).attr("href");
        const text = $(element).text();
        return { url, text };
      })
      .get();

    return {
      message: "Success",
      data: genre,
    };
  } catch (error) {
    console.error(err);
  }
}

async function MangaByGenre(detail) {
  try {
    const htmlResult = await request.get(`${url}genres/${detail}`);
    const $ = await cheerio.load(htmlResult);

    const byGenre = $("#content > div > div.postbody > div > div.listupd > div")
      .map((index, element) => {
        const title = $(element).find(".tt").text();
        const cleanTitle = title.trim();
        const url = $(element).find("a").attr("href");
        const img = $(element).find("img").attr("src");
        const lastChapt = $(element).find(".epxs").text();
        const rating = $(element).find(".numscore").text();
        return { cleanTitle, url, img, lastChapt, rating };
      })
      .get();

    const next = $(
      "#content > div > div.postbody > div > div.pagination > a.next.page-numbers"
    ).attr("href");

    const prev = $(
      "#content > div > div.postbody > div > div.pagination > a.prev.page-numbers"
    ).attr("href");

    return {
      message: "Success",
      data: byGenre,
      paginate: {
        next: next,
        prev: prev,
      },
    };
  } catch (error) {
    console.error(err);
  }
}

async function MangaByGenrewithPage(detail, number) {
  try {
    const htmlResult = await request.get(
      `${url}genres/${detail}/page/${number}`
    );
    const $ = await cheerio.load(htmlResult);

    const byGenre = $("#content > div > div.postbody > div > div.listupd > div")
      .map((index, element) => {
        const title = $(element).find(".tt").text();
        const cleanTitle = title.trim();
        const url = $(element).find("a").attr("href");
        const img = $(element).find("img").attr("src");
        const lastChapt = $(element).find(".epxs").text();
        const rating = $(element).find(".numscore").text();
        return { cleanTitle, url, img, lastChapt, rating };
      })
      .get();

    const next = $(
      "#content > div > div.postbody > div > div.pagination > a.next.page-numbers"
    ).attr("href");

    const prev = $(
      "#content > div > div.postbody > div > div.pagination > a.prev.page-numbers"
    ).attr("href");

    return {
      message: "Success",
      data: byGenre,
      paginate: {
        next: next,
        prev: prev,
      },
    };
  } catch (error) {
    console.error(err);
  }
}

async function Manga(detail) {
  try {
    const htmlResult = await request.get(`${url}manga/${detail}`);
    const $ = await cheerio.load(htmlResult);

    const komikDetail = $(".bigcontent")
      .map((index, element) => {
        const title = $(element).find("h1").text();
        const img = $(element).find("img").attr("src");
        const rating = $(element).find(".num").text();
        const status = $(element)
          .find('.tsinfo .imptdt:contains("Status") i')
          .text();
        const type = $(element)
          .find('.tsinfo .imptdt:contains("Type") a')
          .text();
        const alternate = $(element)
          .find('.wd-full:contains("Judul Alternatif") span')
          .text();
        const description = $(element).find(".wd-full > .entry-content").text();
        const fmed = $(element).find(".fmed");
        const released = $(fmed).eq(0).find("span").text().trim();
        const author = $(fmed).eq(1).find("span").text().trim();
        const artist = $(fmed).eq(2).find("span").text().trim();
        const url = detail;
        const genres = [];
        $(".mgen").map((index, element) => {
          const genre = $(element)
            .find("a")
            .each((index, element) => {
              var text = $(element).text();
              genres.push(text);
            });
        });

        return {
          title,
          img,
          rating,
          status,
          type,
          alternate,
          description,
          released,
          author,
          artist,
          url,
          genres,
        };
      })
      .get();

    const chapter = $("#chapterlist > ul > li > div > div > a")
      .map((index, element) => {
        const linkRaw = $(element).attr("href");
        const link = linkRaw.replace(url, "");
        const name = $(element).find(".chapternum").text();
        const date = $(element).find(".chapterdate").text();

        return { link, name, date };
      })
      .get();

    const recomendation = $("div.listupd > div")
      .map((index, element) => {
        const title = $(element).find(".tt").text();
        const cleanTitle = title.trim();
        const urlRaw = $(element).find("a").attr("href");
        const urls = urlRaw.replace(url, "");
        const img = $(element).find("img").attr("src");
        const type = $(element).find("span").text();
        const lastChapt = $(element).find(".epxs").text();
        const rating = $(element).find(".numscore").text();
        const popular = {
          cleanTitle,
          urls,
          urlRaw,
          img,
          lastChapt,
          type,
          rating,
        };

        return popular;
      })
      .get();

    return {
      message: "Success",
      data: {
        description: komikDetail,
        chapter: chapter,
      },
      recomendation: recomendation,
    };
  } catch (error) {
    console.error(err);
  }
}

async function Chapter(detail) {
  let localBrowser = false;
  try {
    if (!browser) {
      browser = await puppeteer.launch({ headless: false });
      localBrowser = true; // Indicates that this function launched the browser
    }

    const page = await browser.newPage();
    await page.goto(`${url}/${detail}`);

    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract manga details
    const postArea = $(".postarea").first();
    const rTitle = postArea.find(".headpost > h1").text();
    const title = rTitle.replace(/ Bahasa Indonesia$/, "");
    const mangaInfo = postArea.find(".allc > a").text();
    const mangaInfoUrl = postArea.find(".allc > a").attr("href").replace(url, "");

    // Extract image sources
    const srcList = $("#readerarea img").map((_, el) => $(el).attr("src")).get();

    // Extract chapter details
    const chapterRaw = $("#chapter > option:selected").text();
    const regex = /Chapter (\d+)/;
    const match = regex.exec(chapterRaw);
    const chapter = match ? `Chapter ${match[1]}` : undefined;

    const dateTime = postArea.find(".entry-date").attr("datetime");

    // Extract pagination
    const nextprev = $(".nextprev a").map((_, el) => $(el).attr("href")).get();
    const prev = nextprev[0]?.replace(url, "");
    const next = nextprev[1]?.replace(url, "");

    if (localBrowser) {
      await browser.close();
      browser = null; // Reset the global browser instance
    }
    return {
      message: "Success",
      data: { title, chapter, mangaInfo, mangaInfoUrl, srcList, dateTime },
      paginate: { prev, next },
    };
  
  } catch (error) {
    console.error(error);
    if (localBrowser && browser) {
      await browser.close();
      browser = null; // Reset the global browser instance
    }
    throw error;
  }
}


module.exports = {
  PopularTodays,
  LatestManga,
  LatestMangawithPage,
  Manga,
  Chapter,
};
