import OpenAI from "openai";

async function main() {
  const openai = new OpenAI();

  const tools: Array<OpenAI.ChatCompletionTool> = [
    {
      type: "function",
      function: {
        name: "get_delivery_date",
        description:
          "Get the delivery date for a customer's order. Call this whenever you need to know the delivery date, for example when a customer asks 'Where is my package'",
        parameters: {
          type: "object",
          properties: {
            order_id: {
              type: "string",
              description: "The customer's order ID.",
            },
          },
          required: ["order_id"],
          additionalProperties: false,
        },
      },
    },
  ];

  const messages: Array<OpenAI.ChatCompletionMessageParam> = [];
  messages.push({
    role: "system",
    content:
      "You are a helpful customer support assistant. Use the supplied tools to assist the user.",
  });
  messages.push({
    role: "user",
    content: "Hi, can you tell me the delivery date for my order?",
  });
  messages.push({
    role: "assistant",
    content:
      "Hi there! I can help with that. Can you please provide your order ID?",
  });
  messages.push({ role: "user", content: "i think it is order_12345" });

  function get_delivery_date(
    response: OpenAI.Chat.Completions.ChatCompletion,
    orderID: string
  ): OpenAI.ChatCompletionMessageParam {
    return {
      role: "tool",
      content: JSON.stringify({
        order_id: orderID,
        delivery_date: "2024-01-10 13:45:00",
      }),
      tool_call_id: response.choices[0].message.tool_calls![0].id,
    };
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    tools: tools,
  });

  messages.push(response.choices[0].message);
  console.log(response.choices[0].message);

  if (response.choices[0].message.tool_calls) {
    const toolCall = response.choices[0].message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    const order_id = args.order_id;

    // Call the get_delivery_date function with the extracted order_id
    const delivery_date = get_delivery_date(response, order_id);

    messages.push(delivery_date);
  }

  const response2 = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    tools: tools,
  });

  console.log(response2.choices[0].message);
}

main();
