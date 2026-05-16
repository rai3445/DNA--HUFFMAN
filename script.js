/* ========================================
   DNA HUFFMAN COMPRESSION - JAVASCRIPT ENGINE
   Advanced Bioinformatics Analysis System
   ======================================== */

// ============ HUFFMAN CODING ENGINE ============

/**
 * Node class for Huffman Tree
 * Represents a node in the binary tree structure
 */
class HuffmanNode {
    constructor(char = null, freq = 0, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

/**
 * Huffman Compression Engine
 * Implements complete Huffman coding algorithm
 */
class HuffmanCompressionEngine {
    constructor(sequence) {
        this.sequence = sequence.toUpperCase();
        this.frequencies = {};
        this.huffmanTree = null;
        this.huffmanCodes = {};
        this.compressedBinary = '';
        this.standardBinary = '';
        this.decompressed = '';
    }

    /**
     * Calculate frequency of each DNA base
     * @returns {Object} Frequency map
     */
    calculateFrequencies() {
        this.frequencies = { A: 0, T: 0, C: 0, G: 0 };
        
        for (let char of this.sequence) {
            if (char in this.frequencies) {
                this.frequencies[char]++;
            }
        }
        
        return this.frequencies;
    }

    /**
     * Generate standard 2-bit binary representation
     * A = 00, T = 01, C = 10, G = 11
     * @returns {String} Binary string
     */
    generateStandardBinary() {
        const binaryMap = { A: '00', T: '01', C: '10', G: '11' };
        this.standardBinary = '';
        
        for (let char of this.sequence) {
            if (char in binaryMap) {
                this.standardBinary += binaryMap[char];
            }
        }
        
        return this.standardBinary;
    }

    /**
     * Build Huffman tree from frequency map
     * Uses priority queue (min-heap) approach
     * @returns {HuffmanNode} Root of Huffman tree
     */
    buildHuffmanTree() {
        // Create leaf nodes
        let nodes = [];
        for (let [char, freq] of Object.entries(this.frequencies)) {
            if (freq > 0) {
                nodes.push(new HuffmanNode(char, freq));
            }
        }
        
        // Handle edge case: single character
        if (nodes.length === 1) {
            this.huffmanTree = new HuffmanNode(null, nodes[0].freq, nodes[0], null);
            return this.huffmanTree;
        }
        
        // Build tree bottom-up
        while (nodes.length > 1) {
            // Sort by frequency
            nodes.sort((a, b) => a.freq - b.freq);
            
            // Take two smallest nodes
            let left = nodes.shift();
            let right = nodes.shift();
            
            // Create parent node
            let parent = new HuffmanNode(
                null,
                left.freq + right.freq,
                left,
                right
            );
            
            nodes.push(parent);
        }
        
        this.huffmanTree = nodes[0];
        return this.huffmanTree;
    }

    /**
     * Generate Huffman codes from tree
     * Uses recursive traversal
     * @param {HuffmanNode} node - Current node
     * @param {String} code - Current code path
     */
    generateHuffmanCodes(node = this.huffmanTree, code = '') {
        if (!node) return;
        
        // Leaf node - store the code
        if (node.char !== null) {
            this.huffmanCodes[node.char] = code || '0';
        } else {
            // Traverse left and right
            if (node.left) this.generateHuffmanCodes(node.left, code + '0');
            if (node.right) this.generateHuffmanCodes(node.right, code + '1');
        }
    }

    /**
     * Compress sequence using Huffman codes
     * @returns {String} Compressed binary string
     */
    compressSequence() {
        this.compressedBinary = '';
        
        for (let char of this.sequence) {
            if (char in this.huffmanCodes) {
                this.compressedBinary += this.huffmanCodes[char];
            }
        }
        
        return this.compressedBinary;
    }

    /**
     * Decompress Huffman binary back to sequence
     * @param {String} binary - Compressed binary string
     * @returns {String} Decompressed DNA sequence
     */
    decompressSequence(binary = this.compressedBinary) {
        this.decompressed = '';
        let currentNode = this.huffmanTree;
        
        for (let bit of binary) {
            // Traverse tree based on bit
            currentNode = bit === '0' ? currentNode.left : currentNode.right;
            
            // Leaf node - found a character
            if (currentNode && currentNode.char !== null) {
                this.decompressed += currentNode.char;
                currentNode = this.huffmanTree;
            }
        }
        
        return this.decompressed;
    }

    /**
     * Calculate compression statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const originalBits = this.standardBinary.length;
        const compressedBits = this.compressedBinary.length;
        const bitsSaved = originalBits - compressedBits;
        const compressionRatio = originalBits > 0 
            ? (compressedBits / originalBits * 100).toFixed(2)
            : 0;
        const efficiency = originalBits > 0
            ? (bitsSaved / originalBits * 100).toFixed(2)
            : 0;
        
        // Average code length
        let totalCodeLength = 0;
        for (let [char, code] of Object.entries(this.huffmanCodes)) {
            totalCodeLength += code.length * this.frequencies[char];
        }
        const avgCodeLength = this.sequence.length > 0
            ? (totalCodeLength / this.sequence.length).toFixed(2)
            : 0;
        
        return {
            originalBits,
            compressedBits,
            bitsSaved,
            compressionRatio: compressionRatio + '%',
            efficiency: efficiency + '%',
            avgCodeLength
        };
    }

    /**
     * Execute complete compression pipeline
     */
    execute() {
        this.calculateFrequencies();
        this.generateStandardBinary();
        this.buildHuffmanTree();
        this.generateHuffmanCodes();
        this.compressSequence();
        this.decompressSequence();
    }
}

// ============ UI CONTROLLER ============

/**
 * Main Application Controller
 * Manages all UI interactions and data flow
 */
class DNACompressionApp {
    constructor() {
        this.engine = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Input elements
        this.dnaInput = document.getElementById('dnaInput');
        this.processBtn = document.getElementById('processBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.sampleBtn = document.getElementById('sampleBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        // Info elements
        this.seqLength = document.getElementById('seqLength');
        this.validCheck = document.getElementById('validCheck');
        
        // Frequency elements
        this.freqA = document.getElementById('freqA');
        this.freqT = document.getElementById('freqT');
        this.freqC = document.getElementById('freqC');
        this.freqG = document.getElementById('freqG');
        this.freqBarA = document.getElementById('freqBarA');
        this.freqBarT = document.getElementById('freqBarT');
        this.freqBarC = document.getElementById('freqBarC');
        this.freqBarG = document.getElementById('freqBarG');
        this.freqPercA = document.getElementById('freqPercA');
        this.freqPercT = document.getElementById('freqPercT');
        this.freqPercC = document.getElementById('freqPercC');
        this.freqPercG = document.getElementById('freqPercG');
        
        // Tree element
        this.huffmanTreeContainer = document.getElementById('huffmanTreeContainer');
        
        // Table element
        this.tableBody = document.getElementById('tableBody');
        
        // Statistics elements
        this.originalBits = document.getElementById('originalBits');
        this.compressedBits = document.getElementById('compressedBits');
        this.compressionRatio = document.getElementById('compressionRatio');
        this.bitsSaved = document.getElementById('bitsSaved');
        this.efficiency = document.getElementById('efficiency');
        this.avgCodeLength = document.getElementById('avgCodeLength');
        
        // Output elements
        this.standardBinary = document.getElementById('standardBinary');
        this.huffmanBinary = document.getElementById('huffmanBinary');
        this.decompressedOutput = document.getElementById('decompressedOutput');
        
        // Copy buttons
        this.copyStandardBtn = document.getElementById('copyStandardBtn');
        this.copyHuffmanBtn = document.getElementById('copyHuffmanBtn');
        this.copyDecompressedBtn = document.getElementById('copyDecompressedBtn');
        
        // Loader and notification
        this.loader = document.getElementById('loader');
        this.notification = document.getElementById('notification');
    }

    /**
     * Attach event listeners to buttons
     */
    attachEventListeners() {
        this.processBtn.addEventListener('click', () => this.processDNA());
        this.randomBtn.addEventListener('click', () => this.generateRandomDNA());
        this.sampleBtn.addEventListener('click', () => this.loadSampleDNA());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        this.dnaInput.addEventListener('input', () => this.updateInputInfo());
        
        this.copyStandardBtn.addEventListener('click', () => this.copyToClipboard(this.standardBinary.textContent, 'Standard Binary'));
        this.copyHuffmanBtn.addEventListener('click', () => this.copyToClipboard(this.huffmanBinary.textContent, 'Huffman Compressed'));
        this.copyDecompressedBtn.addEventListener('click', () => this.copyToClipboard(this.decompressedOutput.textContent, 'DNA Sequence'));
    }

    /**
     * Validate DNA sequence
     * @param {String} sequence - DNA sequence to validate
     * @returns {Boolean} True if valid
     */
    isValidDNASequence(sequence) {
        return /^[ATCG]*$/.test(sequence);
    }

    /**
     * Update input information display
     */
    updateInputInfo() {
        const sequence = this.dnaInput.value.toUpperCase();
        const length = sequence.length;
        const isValid = this.isValidDNASequence(sequence);
        
        this.seqLength.textContent = length;
        this.validCheck.textContent = isValid ? '✓' : '✗';
        this.validCheck.className = isValid ? 'value valid' : 'value invalid';
    }

    /**
     * Generate random DNA sequence
     */
    generateRandomDNA() {
        const bases = ['A', 'T', 'C', 'G'];
        const length = Math.floor(Math.random() * 40) + 20; // 20-60 bases
        let sequence = '';
        
        for (let i = 0; i < length; i++) {
            sequence += bases[Math.floor(Math.random() * 4)];
        }
        
        this.dnaInput.value = sequence;
        this.updateInputInfo();
    }

    /**
     * Load sample DNA sequence
     */
    loadSampleDNA() {
        const samples = [
            'ATCGATCGATCGATCGATCGATCGATCG',
            'AAAATTTTCCCCGGGGAAAATTTTCCCCGGGG',
            'ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG',
            'GATTACACCCATAACAATAC'
        ];
        
        this.dnaInput.value = samples[Math.floor(Math.random() * samples.length)];
        this.updateInputInfo();
    }

    /**
     * Show loading animation
     */
    showLoader() {
        this.loader.classList.add('active');
    }

    /**
     * Hide loading animation
     */
    hideLoader() {
        this.loader.classList.remove('active');
    }

    /**
     * Process DNA sequence
     */
    processDNA() {
        const sequence = this.dnaInput.value.trim();
        
        if (!sequence) {
            this.showNotification('Please enter a DNA sequence', 'error');
            return;
        }
        
        if (!this.isValidDNASequence(sequence)) {
            this.showNotification('Invalid DNA sequence. Use only A, T, C, G', 'error');
            return;
        }
        
        this.showLoader();
        
        // Simulate processing delay for animation
        setTimeout(() => {
            try {
                this.engine = new HuffmanCompressionEngine(sequence);
                this.engine.execute();
                
                this.updateFrequencyDisplay();
                this.updateTreeDisplay();
                this.updateTableDisplay();
                this.updateStatisticsDisplay();
                this.updateBinaryDisplay();
                
                this.hideLoader();
                this.showNotification('DNA sequence processed successfully!', 'success');
            } catch (error) {
                console.error('Error processing DNA:', error);
                this.hideLoader();
                this.showNotification('Error processing sequence', 'error');
            }
        }, 800);
    }

    /**
     * Update frequency display
     */
    updateFrequencyDisplay() {
        const freq = this.engine.frequencies;
        const total = this.engine.sequence.length;
        
        // Update counts
        this.freqA.textContent = freq.A;
        this.freqT.textContent = freq.T;
        this.freqC.textContent = freq.C;
        this.freqG.textContent = freq.G;
        
        // Update percentages and bars
        const updateFreqCard = (element, barElement, percElement, count) => {
            const percentage = (count / total * 100).toFixed(1);
            percElement.textContent = percentage + '%';
            barElement.style.width = percentage + '%';
        };
        
        updateFreqCard('A', this.freqBarA, this.freqPercA, freq.A);
        updateFreqCard('T', this.freqBarT, this.freqPercT, freq.T);
        updateFreqCard('C', this.freqBarC, this.freqPercC, freq.C);
        updateFreqCard('G', this.freqBarG, this.freqPercG, freq.G);
    }

    /**
     * Update Huffman tree visualization
     */
    updateTreeDisplay() {
        if (!this.engine.huffmanTree) {
            this.huffmanTreeContainer.innerHTML = '<div class="tree-placeholder"><p>No tree data</p></div>';
            return;
        }
        
        const svg = this.generateTreeSVG(this.engine.huffmanTree);
        this.huffmanTreeContainer.innerHTML = '';
        this.huffmanTreeContainer.appendChild(svg);
    }

    /**
     * Generate SVG visualization of Huffman tree
     * @param {HuffmanNode} node - Root node
     * @returns {SVGElement} SVG element
     */
    generateTreeSVG(node) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 800 400');
        svg.setAttribute('class', 'tree-svg');
        
        // Calculate tree dimensions
        const positions = new Map();
        this.calculateTreePositions(node, 400, 20, 150, positions);
        
        // Draw connections
        this.drawConnections(svg, node, positions);
        
        // Draw nodes
        this.drawNodes(svg, node, positions);
        
        return svg;
    }

    /**
     * Calculate positions for tree nodes
     */
    calculateTreePositions(node, x, y, offset, positions, depth = 0) {
        if (!node) return;
        
        positions.set(node, { x, y });
        
        if (node.left) {
            this.calculateTreePositions(node.left, x - offset, y + 60, offset / 2, positions, depth + 1);
        }
        
        if (node.right) {
            this.calculateTreePositions(node.right, x + offset, y + 60, offset / 2, positions, depth + 1);
        }
    }

    /**
     * Draw connections between nodes
     */
    drawConnections(svg, node, positions) {
        if (!node || !positions.has(node)) return;
        
        const { x, y } = positions.get(node);
        
        if (node.left && positions.has(node.left)) {
            const { x: x1, y: y1 } = positions.get(node.left);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', y);
            line.setAttribute('x2', x1);
            line.setAttribute('y2', y1);
            line.setAttribute('class', 'tree-line');
            svg.appendChild(line);
            this.drawConnections(svg, node.left, positions);
        }
        
        if (node.right && positions.has(node.right)) {
            const { x: x2, y: y2 } = positions.get(node.right);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', y);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', 'tree-line');
            svg.appendChild(line);
            this.drawConnections(svg, node.right, positions);
        }
    }

    /**
     * Draw nodes in tree
     */
    drawNodes(svg, node, positions) {
        if (!node || !positions.has(node)) return;
        
        const { x, y } = positions.get(node);
        const isLeaf = node.char !== null;
        
        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '20');
        circle.setAttribute('class', isLeaf ? 'tree-node tree-node-leaf' : 'tree-node');
        svg.appendChild(circle);
        
        // Text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('class', 'tree-text');
        text.textContent = isLeaf ? node.char : node.freq;
        svg.appendChild(text);
        
        // Recurse
        if (node.left) this.drawNodes(svg, node.left, positions);
        if (node.right) this.drawNodes(svg, node.right, positions);
    }

    /**
     * Update encoding table display
     */
    updateTableDisplay() {
        const codes = this.engine.huffmanCodes;
        const freq = this.engine.frequencies;
        
        let html = '';
        for (let [char, code] of Object.entries(codes)) {
            html += `
                <tr>
                    <td>${char}</td>
                    <td>${freq[char]}</td>
                    <td>${code}</td>
                    <td>${code.length}</td>
                </tr>
            `;
        }
        
        this.tableBody.innerHTML = html || '<tr><td colspan="4" class="empty-state">No data</td></tr>';
    }

    /**
     * Update statistics display
     */
    updateStatisticsDisplay() {
        const stats = this.engine.getStatistics();
        
        this.originalBits.textContent = stats.originalBits;
        this.compressedBits.textContent = stats.compressedBits;
        this.compressionRatio.textContent = stats.compressionRatio;
        this.bitsSaved.textContent = stats.bitsSaved;
        this.efficiency.textContent = stats.efficiency;
        this.avgCodeLength.textContent = stats.avgCodeLength;
    }

    /**
     * Update binary output display
     */
    updateBinaryDisplay() {
        const formatBinary = (binary) => {
            return binary.match(/.{1,32}/g)?.join(' ') || binary;
        };
        
        // Standard binary
        if (this.engine.standardBinary) {
            this.standardBinary.innerHTML = formatBinary(this.engine.standardBinary);
        } else {
            this.standardBinary.innerHTML = '<p class="placeholder">No data</p>';
        }
        
        // Huffman binary
        if (this.engine.compressedBinary) {
            this.huffmanBinary.innerHTML = formatBinary(this.engine.compressedBinary);
        } else {
            this.huffmanBinary.innerHTML = '<p class="placeholder">No data</p>';
        }
        
        // Decompressed
        if (this.engine.decompressed) {
            this.decompressedOutput.innerHTML = this.engine.decompressed;
        } else {
            this.decompressedOutput.innerHTML = '<p class="placeholder">No data</p>';
        }
    }

    /**
     * Copy text to clipboard
     */
    copyToClipboard(text, label) {
        if (!text || text === 'No data') {
            this.showNotification('No data to copy', 'error');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(`${label} copied to clipboard!`, 'success');
        }).catch(() => {
            this.showNotification('Failed to copy', 'error');
        });
    }

    /**
     * Show notification toast
     */
    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = 'notification show';
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    /**
     * Clear all data
     */
    clearAll() {
        this.dnaInput.value = '';
        this.engine = null;
        
        // Clear frequency display
        this.freqA.textContent = '0';
        this.freqT.textContent = '0';
        this.freqC.textContent = '0';
        this.freqG.textContent = '0';
        this.freqBarA.style.width = '0%';
        this.freqBarT.style.width = '0%';
        this.freqBarC.style.width = '0%';
        this.freqBarG.style.width = '0%';
        this.freqPercA.textContent = '0%';
        this.freqPercT.textContent = '0%';
        this.freqPercC.textContent = '0%';
        this.freqPercG.textContent = '0%';
        
        // Clear tree
        this.huffmanTreeContainer.innerHTML = '<div class="tree-placeholder"><p>Huffman tree will appear here</p></div>';
        
        // Clear table
        this.tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">No data</td></tr>';
        
        // Clear statistics
        this.originalBits.textContent = '0';
        this.compressedBits.textContent = '0';
        this.compressionRatio.textContent = '0%';
        this.bitsSaved.textContent = '0';
        this.efficiency.textContent = '0%';
        this.avgCodeLength.textContent = '0.00';
        
        // Clear outputs
        this.standardBinary.innerHTML = '<p class="placeholder">No data</p>';
        this.huffmanBinary.innerHTML = '<p class="placeholder">No data</p>';
        this.decompressedOutput.innerHTML = '<p class="placeholder">No data</p>';
        
        // Clear input info
        this.seqLength.textContent = '0';
        this.validCheck.textContent = '✓';
        this.validCheck.className = 'value valid';
        
        this.showNotification('All data cleared', 'info');
    }
}

// ============ APPLICATION INITIALIZATION ============

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new DNACompressionApp();
    
    // Log initialization
    console.log('🧬 DNA Huffman Compression Engine Initialized');
    console.log('Ready for DNA sequence processing');
});
