from rag_service import load_knowledge, search_knowledge

print("Loading knowledge...")

count = load_knowledge()

print("Knowledge chunks stored:", count)

result = search_knowledge(
    "What is inheritance in object-oriented programming?"
)

print("\nRetrieved knowledge:")
print(result)