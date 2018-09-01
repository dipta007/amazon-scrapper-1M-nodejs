const puppeteer = require('puppeteer');
const elasticSearch = require('./elastic-search/elastic')
const asin = require('./get-asin')

const SEARCH_URL = "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=(KEYWORD)&page=(PAGE)"
const PRODUCT_URL = "https://www.amazon.com/dp/"
const PAGE_LIMIT = 20
search_fields = require('./product-list')

const SEARCH_RESULT_SELECTOR = '#s-results-list-atf > li'
const PRODUCT_TITLE_SELECTOR = "#productTitle"


async function getDriver() {
    var browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    return browser
}

browser = null

async function getProduct(asin) {
    try {
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

        // console.log(productTitle, images, price)
    
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
        await page.close()
    } catch(err) {
        console.log(err)
    }
}

async function scrapeSearch(url, starting, ending) {
    var page = await browser.newPage()
    await page.goto(url)

    var promises1 = []
    try {
        asins = await page.evaluate((sel) => {
            const lis = Array.from(document.querySelectorAll('#atfResults > #s-results-list-atf > li'))
            return lis.map(li => li.getAttribute('data-asin'))
        }, '#atfResults')
        for(var j=0; j<asins.length; j++) {
            promises1.push(getProduct(asins[j]))
        }
    } catch(err) {
        console.log(err)
    }
    page.close()
    await Promise.all(promises1)
}

async function giveASearch(searchText) {

    var promises2 = []
    for(var page=1; page<=PAGE_LIMIT; page++) {
        url = SEARCH_URL.replace("(PAGE)", page)
        url = url.replace("(KEYWORD)", searchText)

        promises2.push(scrapeSearch(url, (page-1)*30, page*30))
    }
    await Promise.all(promises2)
}
asins = [
    "B001CYA1HA",
    "B000050FET"
]
async function solve() {
    process.setMaxListeners(0)
    browser = await getDriver()

    var promises = [];
    // for(var i=0; i<asins.length; i++){
    //     promise = getProduct(asins[i])
    //     promises.push(promise)
    // }

    for(var i=0; i<search_fields.length; i++) {
        promise = getProduct(search_fields[i])
        promises.push(promise)
    }
    await Promise.all(promises)
    browser.close()
}

solve();