const puppeteer = require('puppeteer');
const elasticSearch = require('./elastic-search/elastic')
const asin = require('./get-asin')

const SEARCH_URL = "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=(KEYWORD)&page=(PAGE)"
const PRODUCT_URL = "https://www.amazon.com/dp/"
const PAGE_LIMIT = 1
search_fields = [
    "iphone",
    "mobile",
    "beauty",
    "hair",
    "apple",
    "macbook",
    "calcukator",
    "pen",
    "glass",
    "note 8",
    "samsung",
    "wallet",
    "watch"
]

const SEARCH_RESULT_SELECTOR = '#s-results-list-atf > li'
const PRODUCT_TITLE_SELECTOR = "#productTitle"


async function getDriver() {
    var browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    return browser
}

async function getProduct(asin) {
    try {
        var browser = await getDriver()
        var page = await browser.newPage()
        url = PRODUCT_URL + asin
    
        await page.goto(url)
    
        productTitle = await page.evaluate((sel) => {
            var ele = document.querySelector(sel)
            return ele ? ele.innerHTML.trim() : null
        }, '#productTitle')


        images = await page.evaluate((sel) => {
            var imgs = Array.from(document.querySelectorAll('li > span > span > span > span > img'))
            return imgs.map(img => img.getAttribute('src'))
        })
    
        price = null
        if(await page.$("#priceblock_ourprice") !== null) {
            price = await page.evaluate((sel) => {
                var now = document.querySelector('#priceblock_ourprice')
                return now ? parseFloat(now.innerHTML.replace('$', ''))*100.0 : null
            })
        }
        else if(await page.$("#price_inside_buybox") !== null) {
            price = await page.evaluate((sel) => {
                var now = document.querySelector('#price_inside_buybox')
                return now ? parseFloat(now.innerHTML.replace('$', ''))*100.0 : null
            })
        }
    
        if(productTitle && images && images.length && price) {
            var data = {
                index: 'amazon',
                id: asin,
                type: 'product-title',
                body: {
                    "asin": asin,
                    "title": productTitle,
                    "price": price,
                    "images": images,
                }
            }
        
            elasticSearch.insertOne(data).then((resp) => {
            })
        }
    
        browser.close()
    } catch(err) {
        console.log(err)
    }
}

async function scrapeSearch(url, starting, ending) {
    var browser = await getDriver()
    var page = await browser.newPage()
    await page.goto(url)

    try {
        asins = await page.evaluate((sel) => {
            const lis = Array.from(document.querySelectorAll('#atfResults > #s-results-list-atf > li'))
            return lis.map(li => li.getAttribute('data-asin'))
        }, '#atfResults')
        for(var j=0; j<asins.length; j++) {
            getProduct(asins[j])
        }
    } catch(err) {
        console.log(err)
    }
    browser.close()
}

async function giveASearch(searchText) {
    for(var page=1; page<=PAGE_LIMIT; page++) {
        url = SEARCH_URL.replace("(PAGE)", page)
        url = url.replace("(KEYWORD)", searchText)

        await scrapeSearch(url, (page-1)*30, page*30)
    }
}
// asins = [
//     "B001CYA1HA",
//     "B000050FET"
// ]
async function solve() {
    process.setMaxListeners(0)
    // for(var i=0; i<asins.length; i++){
    //     getProduct(asins[i])
    // }
    search_fields.forEach(src => {
        giveASearch(src)
    });
}

solve();