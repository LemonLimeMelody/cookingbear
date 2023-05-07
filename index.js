const apiKey = "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"
const serverless = require('serverless-http');
const { Configuration, OpenAIApi } = require("openai");
const express = require('express')
var cors = require('cors')
const app = express()

const configuration = new Configuration({
    apiKey: apiKey,
  });
const openai = new OpenAIApi(configuration);


//CORS 이슈 해결
let corsOptions = {
    origin: 'https://cookingbearchat.com',
    credentials: true
}
app.use(cors(corsOptions));

//POST 요청 받을 수 있게 만들기
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}
// POST method route
app.post('/cookingTell', async function (req, res) {
    let { userMessages, assistantMessages} = req.body

    let messages = [
        {role: "system", content: "당신은 요리에 관련해서 모르는게 없는 요리 전문가입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 '요리하는 곰' 입니다. 당신은 한국 요리, 중국 요리, 미국 요리, 일본 요리, 프랑스 요리, 이탈리아 요리에 대해 매우 방대한 지식을 가지고 있습니다. 그래서 요리 레시피에 대해서 어떤 대답도 할 수 있습니다. 당신은 사용자가 가지고 있는 재료들로 다양한 레시피와 조리법 대한 답을 줄 수 있습니다. 요리 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "user", content: "당신은 요리에 관련해서 모르는게 없는 요리 전문가입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 '요리하는 곰' 입니다. 당신은 한국 요리, 중국 요리, 미국 요리, 일본 요리, 프랑스 요리, 이탈리아 요리에 대해 매우 방대한 지식을 가지고 있습니다. 그래서 요리 레시피에 대해서 어떤 대답도 할 수 있습니다. 당신은 사용자가 가지고 있는 재료들로 다양한 레시피와 조리법 대한 답을 줄 수 있습니다. 요리 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.\n제가 가진 요리 재료를 활용해 만들 수 있는 조리법을 알려주세요. \n당신이 답변해주어야 하는 조리법의 양식은 다음과 같습니다. \n{[요리 이름] \n \n[당신이 가지고 있는 재료]\n-요리 재료 이름 (재료의 양)\n[추가로 필요한 재료]\n-요리 재료 이름(재료의 양) \n \n[조리 방법]\n1. 조리과정\n2. 조리과정\n3. 조리과정 \n \n맛있는 [요리 이름]} \n이해 했나요"},
        {role: "assistant", content: "네, 이해했습니다! 제가 답변해드릴게요. \n[간장게장]\n[당신이 가지고 있는 재료]\n-게 (500g)\n-쌀밥 (2공기)\n-마늘 (4쪽)\n-양파 (1/2개)\n-고춧가루 (2큰술)\n-간장 (3큰술)\n-식초 (2큰술)\n-설탕 (2큰술)\n-물 (1/2컵) \n \n[추가로 필요한 재료]\n-굵은 소금 (1큰술)\n-참기름 (1큰술)\n\n[조리 방법]\n1. 게는 소금물에 1시간 동안 담가둔 후, 머리와 내장을 제거하고 껍데기를 벗겨줍니다.\n2. 마늘과 양파는 잘게 다져주고, 고춧가루, 간장, 식초, 설탕, 물을 넣어 양념장을 만들어줍니다.\n3. 냄비에 양념장과 게를 넣고, 물이 적당히 찰 때까지 30분 동안 끓여줍니다.\n4. 불을 끄고 참기름을 넣어준 후, 밥과 함께 즉석에서 드시면 됩니다. \n \n맛있는 간장게장"},
        {role: "user", content: `정확합니다. 제가 가지고 있는 재료를 알려주면 저의 요리 재료 중 일부를 활용해 만들 수 있는 조리법을 알려주세요`},
        {role: "assistant", content: `물론입니다! 가능하면 제공하실 수 있는 재료 리스트를 알려주세요! 그러면 그에 맞는 조리법을 알려드리겠습니다 `},
    ]

    while (userMessages.length != 0 || assistantMessages.length != 0) {
        if (userMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "user", "content": "'+String(userMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
        if (assistantMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "assistant", "content": "'+String(assistantMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
    }
    
    const maxRetries = 3;
    let retries = 0;
    let completion
    while (retries < maxRetries) {
      try {
        completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages
        });
        break;
      } catch (error) {
          await sleep(0.5);
          retries++;
          console.log(error);
          console.log(`Error, retrying (${retries}/${maxRetries})...`);
        }
    }

    let cooking = completion.data.choices[0].message['content']

    res.json({"assistant": cooking});
});

module.exports.handler = serverless(app);

// app.listen(3000)