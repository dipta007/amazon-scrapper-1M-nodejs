# Project Title

A simple scrapper to scrape 1M data using distributed system

## Getting Started

Used 200 GOOGLE Compute Engine to scrape
n1-standard-2 (2 vCPU, 7.5 GB) - 0.0950$/hour - 19$/hour (for 200 vCPU)

For Scraping I have used a [script](https://gist.github.com/dipta007/90d42b34053782227d87fed0d377395c) which will execute from GC console. It will create 200 engines in a few minutes, the start up script will install all the dependencies and each one will call the function to scrape 50 products from the 10000 products(Given in the previous task). Here I have used BFS type technique to iterate the products, for each product I have collected all the similar products ASIN from that page and scrape them later.

## Some questions

* How long is takes to get all the data for 1M products? Can you make it faster? How?
  * As I have not examined for the 1M data so I won’t be accurate about it. But my scrapper in one instance scrape around 5000+ data in 1 hour, so for 1M data 200vCPU would take ~1 hour.
  * It can be made faster. There are two ways - 
    * Use the parallel threading more accurately
    * Make the budget bigger
* For each field, what % of the items are missing that field? Any idea why and how to minimise?
  * It was the main problem of my scrapper that I couldn’t fix in the given time. Around 30-40% products miss the fields. I am sure there are some bugs in my scraper, that need to be fixed. Moreover, my scraper obviously not yet can handle all kinds of layouts.
* Approximately, how much will it cost every time you’ll refresh your inventory? How to bring that down?
  * As I discussed above, from my approximation, It will take 19-20$ for the scraping to be finished and to refresh the ElasticDB by 200vCPU in an hour
  * As I told above, we have to implement the scraper to use more parallelism. Then the number of servers can be decreased in a great manner.
* How to scale this to 10M items? Or 100M?
  * To scale this to 10M items or even 100M, the scrapper needs to be totally robust and bug free. So that it can handle all the layouts and it won’t miss any page at all. And it has to use the full power of parallelism, so that it will be faster as well. And at last, the number of servers need to be extended to scale with this type of big data. Moreover, we have to also think about the Elastic DB then. It has to be used in a proper way so it can index and refresh the data as fast as possible. And the server for the ElasticDB has to be scaled with the increase of the data. Maybe we have to give a though about multi-processor programming to use the full power of CPU.

## Built With

* [NodeJS](https://nodejs.org/en/) - The core language
* [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Headless Chrome for NodeJS

## Authors

* **Shubhashis Roy Dipta** - *Initial work* - [dipta007](https://github.com/dipta007)
