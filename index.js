import * as cheerio from 'cheerio'
import axios from 'axios'
import express from 'express'

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.set('view engine', 'ejs');

app.get('/', (request, response) => { // Just to render the index.html on the views folder
    response.render('index');
});

const itens = [];

async function scrape (keyword) { 
    for (var page = 1; page <= 5; page++) { // For loop to get the results from 5 pages
        await axios.get(`https://www.amazon.com/s?k=${keyword}&page=${page}`, { // Making the search with axios
            headers: { // Headers, like the previous project, to not get an error
                Accept: '*/*',
                Host: 'www.amazon.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                Pragma: 'no-cache',
            }
        }).then(res => { 
            const pageData = res.data;
            const $ = cheerio.load(pageData); // Loading the search results with cheerio
        
            const spanWithSearchResults = $('[data-component-type="s-search-results"]'); // Gettin only the search results from the search 
            // The search results are identyfied by a span with the attribute "data-component-type="s-search-results"
        
            $(spanWithSearchResults).find('[data-component-type="s-search-result"]').each((index, item) => { // For each search result found
                let newItem = { // Making a new item for each search result
                    pageNumber: page,
                    itemIndex: index,
                    itemASIN: $(item).attr('data-asin') // Each search result has the attribute "data-asin" and its value is the product's ASIN
                }                                       // Like the search results, these were found by inspecting the amazon page after an item search
                itens.push(newItem); // Pushing the new item into the global variable "itens"
            });
            return (JSON.stringify(itens)); // Returning the search results to the front end as a JSON string
        }).catch (err => { // In case theres an error, sending the error as JSON string
            console.log(err);
            return (JSON.stringify(err));
        });
    }
}

app.get("/api/scrape", async (request, response) => { // Gets the /api/scrape request with the keyword
    let keyword = request.query.keyword;

    await scrape(keyword); // Calls scraping function

    response.send(JSON.stringify(itens)); // Sending response back to front end
});

app.listen(PORT, () => console.log("Server is listening to port:", PORT)); // Listening to the index page, which is set at 5000 (PORT)

