try:
    import torch
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA disponible: {torch.cuda.is_available()}")
    print(f"Version CUDA: {torch.version.cuda}")
except ImportError:
    print("PyTorch n'est pas installé!")
import pandas as pd  
from datasets import Dataset  
from transformers import (
	AutoTokenizer,
	AutoModelForCausalLM,pi
import os  
  
# Configuration CUDA  
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")  
print(f"Utilisation du device: {device}")  
  
# 1. Chargement du dataset  
df = pd.read_csv('dataset_rh.csv')  
print(f"Dataset chargé: {len(df)} exemples")  
  
# 2. Préparation du modèle et tokenizer  
model_name = "google/gemma-2b"  # ou "mistralai/Mistral-7B-v0.1"  
tokenizer = AutoTokenizer.from_pretrained(model_name)  
tokenizer.pad_token = tokenizer.eos_token  
  
# Chargement du modèle avec quantization 4-bit pour économiser la mémoire  
model = AutoModelForCausalLM.from_pretrained(
	model_name,
	torch_dtype=torch.float16,
	device_map="auto",
	load_in_4bit=True,
	bnb_4bit_compute_dtype=torch.float16,
	bnb_4bit_quant_type="nf4",
	bnb_4bit_use_double_quant=True,
)
  
# 3. Configuration LoRA pour un fine-tuning efficace  
lora_config = LoraConfig(  
	task_type=TaskType.CAUSAL_LM,  
	inference_mode=False,  
	r=16,  # rang de la décomposition  
	lora_alpha=32,  
	lora_dropout=0.1,  
	target_modules=["q_proj", "v_proj", "k_proj", "o_proj"]  
)  
  
model = get_peft_model(model, lora_config)  
model.print_trainable_parameters()  
  
# 4. Préparation des données  
def format_prompt(question, reponse):  
	return f"Question RH: {question}\nRéponse: {reponse}<|endoftext|>"  
  
# Formatage des données  
formatted_data = []  
for _, row in df.iterrows():
	formatted_text = format_prompt(row['question'], row['reponse'])
	formatted_data.append({"text": formatted_text})
  
# Conversion en Dataset Hugging Face  
dataset = Dataset.from_list(formatted_data)  
  
#

# Fonction de tokenization
def tokenize_function(examples):
	return tokenizer(
		examples["text"],
		truncation=True,
		padding=False,
		max_length=512,
		return_overflowing_tokens=False,
	)

# Tokenization du dataset  
tokenized_dataset = dataset.map(
	tokenize_function,
	batched=True,
	remove_columns=dataset.column_names,
)
  
# Split train/validation  
train_dataset = tokenized_dataset.train_test_split(test_size=0.1)  
  
# 5. Configuration de l'entraînement  
training_args = TrainingArguments(
	output_dir="./gemma-rh-finetuned",
	overwrite_output_dir=True,
	num_train_epochs=3,
	per_device_train_batch_size=2,
	per_device_eval_batch_size=2,
	gradient_accumulation_steps=4,
	warmup_steps=100,
	max_steps=500,
	learning_rate=2e-4,
	fp16=True,
	logging_steps=10,
	save_steps=100,
	eval_steps=100,
	evaluation_strategy="steps",
	save_strategy="steps",
	load_best_model_at_end=True,
	report_to=None,
	dataloader_pin_memory=False,
)
  
# Data collator  
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer,mlm=False,  )  
  
# 6. Création du Trainer  
trainer = Trainer(  
	model=model,  
	args=training_args,  
	train_dataset=train_dataset["train"],  
	eval_dataset=train_dataset["test"],  
	data_collator=data_collator,  
)  
  
# 7. Entraînement  
print("Début de l'entraînement...")  
trainer.train()  
  
# 8. Sauvegarde du modèle  
model.save_pretrained("./gemma-rh-final")  
tokenizer.save_pretrained("./gemma-rh-final")  
  
print("Fine-tuning terminé!")  
  
# 9. Test du modèle fine-tuné  
def generate_response(question, max_length=200):
	prompt = f"Question RH: {question}\nRéponse:"
	inputs = tokenizer(prompt, return_tensors="pt").to(device)
	with torch.no_grad():
		outputs = model.generate(
			**inputs,
			max_length=max_length,
			temperature=0.7,
			do_sample=True,
			pad_token_id=tokenizer.eos_token_id
		)
		response = tokenizer.decode(outputs[0], skip_special_tokens=True)
	return response.split("Réponse:")[-1].strip()
  
# Test avec quelques questions  
test_questions = [
	"Quelles sont vos principales motivations ?",
	"Comment gérez-vous les conflits en équipe ?",
	"Décrivez votre style de management"
]
  
print("\n=== Tests du modèle fine-tuné ===")  
for question in test_questions:
	response = generate_response(question)
	print(f"\nQ: {question}")
	print(f"R: {response}")