const https = require(`https`)
const fs = require(`fs`)

function http_get(url) {
    return new Promise(resolve => {
        const request = https.request(url, response => {
            const data = {
                body: ``,
                status: response.status,
                headers: response.headers,
            }
            response.on(`data`, chunk => data.body += chunk)
            response.on(`end`, () => resolve(data))
        })
        request.end()
    })
}

function stream_download(url, directory) {
    const file = fs.createWriteStream(directory)
    const request = https.request(url, response => {
        response.pipe(file)
        file.on(`finish`, () => file.close())
    })
    request.end()
}

async function request_image_batch(batch_size = 100) {
    const url = `https://shibe.online/api/shibes?count=${batch_size}&urls=false`
    const response = await http_get(url)
    JSON.parse(response.body)
        .forEach(hash => stream_download(`https://cdn.shibe.online/shibes/${hash}.jpg`, `./container/${hash}.jpg`))
}

if (!fs.existsSync(`./container`)) {
    fs.mkdirSync(`./container`)
}

const [ ,, batch_size ] = process.argv
request_image_batch(batch_size)
    .then(() => console.log(`process done`))