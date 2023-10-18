import app from '../app';
import bodyParser from 'body-parser';

app.use(bodyParser.json());

// Define a list of regular expressions to match common bot user agents
const botPatterns: RegExp[] = [
    /Googlebot/i,
    /bingbot/i,
    /Yahoo! Slurp/i,
    /YandexBot/i,
    /Baiduspider/i,
    /DuckDuckbot/i,
    /ReverseEngineeringBot/i,
    /SeekportBot/i,
    /DecompilationBot/i,
    /AhrefsBot/i,
    /DongleEmulatorBot/i
    // Add more bot user agent patterns as needed
];

// Define a route that handles incoming visitor data
// TODO: Entiiä miten tää endpointti tehdään ja määritetään :D
app.post('/your-visitor-endpoint', (req, res) => {

    // Access visitor data from the request body
    const visitorData = req.body;
    const userAgent = visitorData.user_agent;

    if (isBot(userAgent)) {
        // TODO : Jos halutaan jotain logiikkaa kun botti on havaittu
        // Do not process data for bots
        res.status(403).json({ message: 'Bot detected' });
    } else {
        // Process data for non-bots
        // TODO : Logiikka miten halutaan toimia, luultavasti vain lähetetään data eteenpäin sillä botin tsekkaus tehty ?
        res.json({ message: 'Visitor data received and processed succesfully' });
    }
    
    // Test: Send a response back to the frontend
    res.json({ message: 'Visitor data received and processed' });
});


// Test out if the user agent contains any of the known bots
function isBot(userAgent: string): boolean {
    for (const pattern of botPatterns) {
        if (pattern.test(userAgent)) {
            return true;
        }
    }
    return false;
}
