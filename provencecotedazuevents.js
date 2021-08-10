const puppeteer = require('puppeteer');
const fs = require('fs');
const Json2csv = require('json2csv').Parser;

const url ='https://www.provencecotedazurevents.com/en/';
let infos = [];

(async () =>{
  const browser = await puppeteer.launch({headless: false});
  const site = await browser.newPage()
  await site.goto(url, {waitUntil: "networkidle2" });
  await site.setViewport({
    width: 1920,
    height: 1080
});
  await site.waitForSelector('#location_search');
  const searchInput = await site.$('#location_search');
  await searchInput.type("Provence-Alpes-Côte d'Azur, France");

  await site.click('.col-md-12 > .main-search-input > div > #listeo_core-search-form > .button');
  console.log('click !');
  await site.waitForTimeout(10000);
  let links = await site.$$eval('#listeo-listings-container > .col-lg-12 > div > a', as => as.map(a => a.href));
  console.log(links);
  let progress = 0;
  for(const link of links)
  {
    progress++;
    console.log(progress+'/'+links.length);
    const page = await browser.newPage();
    await page.goto(link);
    await page.waitForSelector('.row > .col-lg-4 > .pce-sidebar > h3 > span');

    //get Name
    let  nameElement = await page.$('.row > .col-lg-4 > .pce-sidebar > h3 > span');
    let name = await page.evaluate(el => el.innerText, nameElement);

    //get City
    let  cityElement = await page.$('.col-lg-8 > #titlebar > .listing-titlebar-title > span > .listing-address');
    let city = 'n/a';
    if(cityElement != null) city = await page.evaluate(el => el.innerText, cityElement);

    //get sector 
    let  sectorElement = await page.$('#titlebar > .listing-titlebar-title > h2 > .listing-tag > a');
    let sector = 'n/a';
    if(sectorElement != null) sector = await page.evaluate(el => el.innerText, sectorElement);

    //get mail 
    let  mailElement = await page.$('.col-lg-4 > .pce-sidebar > .list-pce-contacts > li:nth-child(2) > .listing-links');
    let mail = 'n/a';
    if(mailElement != null) mail = await page.evaluate(el => el.innerText, mailElement);

    //get phone 
    let  phoneElement = await page.$('.col-lg-4 > .pce-sidebar > .list-pce-contacts > li:nth-child(1) > .listing-links');
    let phone = 'n/a';
    if(phoneElement != null) phone = await page.evaluate(el => el.innerText, phoneElement);

    //get website 
    let  websiteElement = await page.$('.col-lg-4 > .pce-sidebar > .list-pce-contacts > li:nth-child(3) > .listing-links');
    if(websiteElement != null) website = await page.$eval('.col-lg-4 > .pce-sidebar > .list-pce-contacts > li:nth-child(3) > .listing-links', (a) => a.href);
    else website = 'n/a';
    console.log(website);

    await infos.push({
      'Name': name,
      'Country': 'France',
      'Region': 'n/a',
      'Address': city,
      'Sector': sector,
      'Mail' : mail,
      'Main Phone': phone,
      'Secondary Phone': 'n/a',
      'Contact name': 'n/a',
      'WebSite': website,
      'Link': link
    })
    
    await page.close();
  }

  console.log('click !');
  await site.waitForTimeout(10000);
  links = await site.$$eval('#listeo-listings-container > .col-lg-12 > div > a', as => as.map(a => a.href));
  console.log(links);
  progress = 0;
  for(const link of links)
  {
    progress++;
    console.log(progress+'/'+links.length);
    const page = await browser.newPage();
    await page.goto(link);
    await page.waitForSelector('.row > .col-lg-4 > .pce-sidebar > h3 > span');

    //get Name
    let  nameElement = await page.$('.row > .col-lg-4 > .pce-sidebar > h3 > span');
    let name = await page.evaluate(el => el.innerText, nameElement);

    //get City
    let  cityElement = await page.$('.col-lg-8 > #titlebar > .listing-titlebar-title > span > .listing-address');
    let city = 'n/a';
    if(cityElement != null) city = await page.evaluate(el => el.innerText, cityElement);

    //get sector 
    let  sectorElement = await page.$('#titlebar > .listing-titlebar-title > h2 > .listing-tag > a');
    let sector = 'n/a';
    if(sectorElement != null) sector = await page.evaluate(el => el.innerText, sectorElement);

    //get mail 
    let  mailElement = await page.$('.col-lg-4 > .pce-sidebar > .list-pce-contacts > li:nth-child(2) > .listing-links');
    let mail = 'n/a';
    if(mailElement != null) mail = await page.evaluate(el => el.innerText, mailElement);

    //get phone 
    let  phoneElement = await page.$('.col-lg-4 > .pce-sidebar > .list-pce-contacts > li:nth-child(1) > .listing-links');
    let phone = 'n/a';
    if(phoneElement != null) phone = await page.evaluate(el => el.innerText, phoneElement);

    //get website 
    let  websiteElement = await page.$('.col-lg-4 > .pce-sidebar > .list-pce-contacts > li:nth-child(3) > .listing-links');
    if(websiteElement != null) website = await page.$$eval('.col-lg-4 > .pce-sidebar > .list-pce-contacts > li:nth-child(3) > .listing-links', (a) => a.href);
    else website = 'n/a';

    await infos.push({
      'Name': name,
      'Country': 'France',
      'Region': 'n/a',
      'Address': city,
      'Sector': sector,
      'Mail' : mail,
      'Main Phone': phone,
      'Secondary Phone': 'n/a',
      'Contact name': 'n/a',
      'WebSite': website,
      'Link': link
    })
    
    await page.close();
  }

  // await site.waitForTimeout(50000);
  await browser.close();


  await browser.close();
  const j2csv = await new Json2csv(['Name','Country','Region','Address','Sector','Mail','Main Phone','Secondary Phone','Contact name','WebSite','Link']);
  const csv = await j2csv.parse(infos);
    //console.log(csv);
  await fs.writeFileSync('csv/provencecotedazureventsParis.csv',csv, 'ascii')
  console.log('done !');
})();