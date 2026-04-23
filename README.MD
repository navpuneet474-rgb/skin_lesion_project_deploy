2. ABCDE Rule for Melanoma (Skin Cancer Detection)
A checklist for examining skin spots for signs of cancer: 

    A – Asymmetry: One half of the mole does not match the other.
    B – Border: Irregular, ragged, notched, or blurred edges.
    C – Color: The color is not uniform; different shades of brown, black, red, white, or blue.
    D – Diameter: The spot is larger than 6 millimeters (about the size of a pencil eraser).
    E – Evolving: The mole is changing in size, shape, or color over time.
    
    
    Various CNN architectures are designed to solve different problems, ranging from maximum accuracy to high-speed performance on mobile devices. MobileNet is fundamentally different from traditional CNNs because it is specifically optimized for efficiency rather than just raw depth or accuracy. 
Bright Publisher
Bright Publisher
 +4
Why MobileNet is Different
While standard CNNs use regular convolutions, MobileNet uses a specialized technique to reduce computational cost: 
Depthwise Separable Convolutions: Instead of a single 3x3 convolution, MobileNet splits the process into two steps:
Depthwise Convolution: Applies a single filter to each input channel.
Pointwise Convolution: Uses a 1x1 convolution to combine these filtered channels.
Efficiency Gain: This separation typically reduces the number of parameters and operations by 8 to 9 times compared to standard convolutions, with only a small drop in accuracy.
Target Device: It is designed for Mobile and Embedded Systems with limited CPU and memory, unlike heavy architectures like VGG16 or ResNet. 
Bright Publisher
Bright Publisher
 +4


 In this study, Xception [36]
CNN architecture, which has become popular in recent years and gives better results than other architectures in feature
extraction from medical images, is used [37–39]. 

If examiner asks:
👉 “Why mention EfficientNet if you used MobileNet?”

Answer:

“EfficientNet represents modern state-of-the-art approaches. MobileNet was selected as a lightweight alternative suitable for deployment while maintaining good performance.”

🔥 That’s a perfect viva answer

melanoma_count = (pad_df['diagnostic'].str.lower().str.strip() == 'mel').sum()
total_samples = len(pad_df)
print(f"Melanoma samples: {melanoma_count} / {total_samples}")
