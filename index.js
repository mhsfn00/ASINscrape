import * as cheerio from 'cheerio'
import axios from 'axios'
import express from 'express'

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
    response.render('index');
});

const itens = [];

async function scrape (keyword) {
    for (var page = 1; page <= 5; page++) {
        await axios.get(`https://www.amazon.com/s?k=${keyword}&page=${page}`, {
            headers: {
                Accept: '*/*',
                Host: 'www.amazon.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                Pragma: 'no-cache',
            }
        }).then(res => {
            const pageData = res.data;
            const $ = cheerio.load(pageData);
        
            const spanWithSearchResults = $('[data-component-type="s-search-results"]');
        
            $(spanWithSearchResults).find('[data-component-type="s-search-result"]').each((index, item) => {
                let newItem = {
                    pageNumber: page,
                    itemIndex: index,
                    itemASIN: $(item).attr('data-asin')
                }
                itens.push(newItem);
            });
            return (JSON.stringify(itens));
        }).catch (err => {
            console.log(err);
            return (JSON.stringify(err));
        });
    }
}

app.get("/api/scrape", async (request, response) => {
    let keyword = request.query.keyword;

    await scrape(keyword);

    response.send(JSON.stringify(itens));
});

app.listen(PORT, () => console.log("Server is listening to port:", PORT));

