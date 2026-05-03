from openai import OpenAI

client = OpenAI()

models = client.models.list()

for m in models.data:
    if "gpt-5" in m.id:
        print(m.id)