import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Example gene data
genes = [
    {"chrom": "Chr1", "start": 3631, "end": 5899, "id": "AT1G01010"},
    {"chrom": "Chr1", "start": 6788, "end": 9130, "id": "AT1G01020"},
    {"chrom": "Chr1", "start": 11649, "end": 13714, "id": "AT1G01030"},
    {"chrom": "Chr1", "start": 23146, "end": 31227, "id": "AT1G01040"},
]

# Alternate colors
colors = ["lightblue", "darkblue"]

# Create figure
fig, ax = plt.subplots(figsize=(10, 3))

# Plot each gene
for i, gene in enumerate(genes):
    length = gene["end"] - gene["start"]
    rect = patches.Rectangle((gene["start"], 0), length, 1, color=colors[i % 2], label=gene["id"])
    ax.add_patch(rect)

# Add chromosome line
ax.plot([0, max(gene["end"] for gene in genes)], [0, 0], color="black", linewidth=0.5)

# Add labels and legend
ax.set_xlim(0, max(gene["end"] for gene in genes) + 5000)
ax.set_ylim(-1, 2)
ax.set_xlabel("Chromosome Position")
ax.set_title("Arabidopsis thaliana Gene Visualization")
plt.show()
