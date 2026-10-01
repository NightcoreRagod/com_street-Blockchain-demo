/**
 * Commercial Street Multi-Agent Blockchain Retail Simulator
 * ==========================================================
 * Real-time MAS client engine simulating autonomous shoppers, retailer POS nodes,
 * and an Orchestrator coordinating dynamic traffic rerouting and Layer-2 rollups.
 */

// ==============================================================================
// 1. TOPOLOGY & MAP GRAPH CONFIGURATION
// ==============================================================================

const MAP_NODES = {
  "Tasker_Town_Entrance": {
    id: "Tasker_Town_Entrance",
    name: "Tasker Town Entrance",
    type: "entrance",
    x: 0.10, y: 0.50,
    capacity: 100,
    neighbors: ["Dispensary_Rd_Junction", "Shoe_Haven_Bazaar"]
  },
  "Dispensary_Rd_Junction": {
    id: "Dispensary_Rd_Junction",
    name: "Dispensary Road Junction",
    type: "intersection",
    x: 0.25, y: 0.35,
    capacity: 60,
    neighbors: ["Tasker_Town_Entrance", "Central_Pedestrian_Plaza", "Street_Chai_Cafe"]
  },
  "Shoe_Haven_Bazaar": {
    id: "Shoe_Haven_Bazaar",
    name: "Shoe Haven Bazaar",
    type: "retail",
    category: "footwear",
    x: 0.24, y: 0.70,
    capacity: 12,
    basePrice: 45,
    tokenReward: 6,
    neighbors: ["Tasker_Town_Entrance", "Central_Pedestrian_Plaza", "Heritage_Artisan_Alley"]
  },
  "Central_Pedestrian_Plaza": {
    id: "Central_Pedestrian_Plaza",
    name: "Central Pedestrian Plaza",
    type: "plaza",
    x: 0.46, y: 0.50,
    capacity: 120,
    neighbors: ["Dispensary_Rd_Junction", "Shoe_Haven_Bazaar", "Mysore_Silk_Emporium", "Royal_Jewelry_Vault", "Ibrahim_Sahib_St"]
  },
  "Street_Chai_Cafe": {
    id: "Street_Chai_Cafe",
    name: "Street Coffee & Chai",
    type: "retail",
    category: "food",
    x: 0.42, y: 0.20,
    capacity: 10,
    basePrice: 12,
    tokenReward: 3,
    neighbors: ["Dispensary_Rd_Junction", "Tech_Frontier"]
  },
  "Tech_Frontier": {
    id: "Tech_Frontier",
    name: "Tech Frontier Gadgets",
    type: "retail",
    category: "electronics",
    x: 0.62, y: 0.18,
    capacity: 12,
    basePrice: 65,
    tokenReward: 10,
    neighbors: ["Street_Chai_Cafe", "Ibrahim_Sahib_St"]
  },
  "Mysore_Silk_Emporium": {
    id: "Mysore_Silk_Emporium",
    name: "Mysore Silk Emporium",
    type: "retail",
    category: "apparel",
    x: 0.68, y: 0.38,
    capacity: 14,
    basePrice: 85,
    tokenReward: 15,
    neighbors: ["Central_Pedestrian_Plaza", "Royal_Jewelry_Vault", "MG_Road_Exit"]
  },
  "Royal_Jewelry_Vault": {
    id: "Royal_Jewelry_Vault",
    name: "Royal Jewelry Vault",
    type: "retail",
    category: "luxury",
    x: 0.66, y: 0.68,
    capacity: 10,
    basePrice: 180,
    tokenReward: 30,
    neighbors: ["Central_Pedestrian_Plaza", "Mysore_Silk_Emporium", "MG_Road_Exit"]
  },
  "Ibrahim_Sahib_St": {
    id: "Ibrahim_Sahib_St",
    name: "Ibrahim Sahib Street",
    type: "intersection",
    x: 0.72, y: 0.22,
    capacity: 50,
    neighbors: ["Tech_Frontier", "Central_Pedestrian_Plaza", "MG_Road_Exit"]
  },
  "Heritage_Artisan_Alley": {
    id: "Heritage_Artisan_Alley",
    name: "Heritage Artisan Alley",
    type: "retail",
    category: "crafts",
    x: 0.48, y: 0.82,
    capacity: 10,
    basePrice: 28,
    tokenReward: 8,
    neighbors: ["Shoe_Haven_Bazaar", "MG_Road_Exit"]
  },
  "MG_Road_Exit": {
    id: "MG_Road_Exit",
    name: "MG Road South Exit",
    type: "exit",
    x: 0.90, y: 0.50,
    capacity: 100,
    neighbors: ["Mysore_Silk_Emporium", "Royal_Jewelry_Vault", "Heritage_Artisan_Alley", "Ibrahim_Sahib_St"]
  }
};

// ==============================================================================
// 2. PERSONA DEFINITIONS
// ==============================================================================

const PERSONA_CONFIGS = {
  "Bargain Hunter": {
    color: "#10b981",
    budgetRange: [60, 140],
    incentiveSensitivity: 0.95,
    purchaseProb: 0.75,
    maxQueueWait: 3,
    speed: 1.1
  },
  "Window Shopper": {
    color: "#00f2fe",
    budgetRange: [30, 75],
    incentiveSensitivity: 0.35,
    purchaseProb: 0.25,
    maxQueueWait: 2,
    speed: 0.9
  },
  "High Spender": {
    color: "#f59e0b",
    budgetRange: [250, 550],
    incentiveSensitivity: 0.20,
    purchaseProb: 0.85,
    maxQueueWait: 6,
    speed: 1.3
  },
  "Rush Shopper": {
    color: "#8b5cf6",
    budgetRange: [80, 180],
    incentiveSensitivity: 0.55,
    purchaseProb: 0.90,
    maxQueueWait: 2,
    speed: 1.6
  }
};

// ==============================================================================
// 3. CRYPTOGRAPHIC & DATA MODELS
// ==============================================================================

function generateHex(length = 16) {
  const chars = "0123456789abcdef";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

class Transaction {
  constructor(shopperId, retailerNodeId, amount, tokens) {
    this.txId = "0x" + generateHex(12);
    this.shopperId = shopperId;
    this.retailerNodeId = retailerNodeId;
    this.amount = Number(amount.toFixed(2));
    this.tokens = Number(tokens.toFixed(1));
    this.timestamp = new Date();
    this.signature = "0x" + generateHex(24);
    this.l1Gas = 21000;
    this.rollupGas = 3600;
  }
}

class RollupBlock {
  constructor(blockNum, txs, prevHash) {
    this.blockNumber = blockNum;
    this.transactions = txs;
    this.prevHash = prevHash;
    this.timestamp = new Date();
    this.merkleRoot = "0x" + generateHex(32);
    this.blockHash = "0x" + generateHex(32);
    
    const l1GasTotal = txs.reduce((acc, t) => acc + t.l1Gas, 0);
    const rollupGasTotal = 45000 + txs.reduce((acc, t) => acc + t.rollupGas, 0);
    this.gasSavedPct = l1GasTotal > 0 ? Math.max(0, ((l1GasTotal - rollupGasTotal) / l1GasTotal) * 100) : 0;
  }
}

// ==============================================================================
// 4. AGENT SYSTEM
// ==============================================================================

class ShopperAgent {
  constructor(id, personaName) {
    this.id = id;
    this.personaName = personaName;
    this.config = PERSONA_CONFIGS[personaName];
    this.wallet = Math.floor(Math.random() * (this.config.budgetRange[1] - this.config.budgetRange[0])) + this.config.budgetRange[0];
    this.initialWallet = this.wallet;
    this.tokensEarned = 0;
    this.purchasesCount = 0;
    
    this.currentNodeId = "Tasker_Town_Entrance";
    this.targetNodeId = null;
    this.progress = 0; // 0 to 1 interpolation between nodes
    
    this.state = "WALKING"; // WALKING, QUEUING, TRANSACTING, FINISHED
    this.queueTimer = 0;
    this.cart = [];
    this.pathHistory = ["Tasker_Town_Entrance"];

    // Physical position on canvas
    const startNode = MAP_NODES[this.currentNodeId];
    this.x = startNode.x;
    this.y = startNode.y;
    this.radius = 4.5;
  }

  update(orchestrator, canvasW, canvasH) {
    if (this.state === "FINISHED") return null;

    if (this.wallet <= 5) {
      this.state = "FINISHED";
      return null;
    }

    // 1. Queuing inside store
    if (this.state === "QUEUING") {
      this.queueTimer++;
      const store = orchestrator.retailNodes[this.currentNodeId];
      if (store && store.posQueue[0] === this) {
        this.state = "TRANSACTING";
      } else if (this.queueTimer > (this.config.maxQueueWait * 40)) {
        // Abandon queue due to impatience!
        if (store) {
          const idx = store.posQueue.indexOf(this);
          if (idx > -1) store.posQueue.splice(idx, 1);
        }
        orchestrator.recordCrowdJam(this.currentNodeId);
        this.state = "WALKING";
        this.queueTimer = 0;
        this.pickNextDestination(orchestrator);
      }
      return null;
    }

    // 2. Transacting at POS
    if (this.state === "TRANSACTING") {
      const store = orchestrator.retailNodes[this.currentNodeId];
      const storeData = MAP_NODES[this.currentNodeId];
      
      const price = Math.min(this.wallet, storeData.basePrice * (0.85 + Math.random() * 0.35));
      const incentiveMult = orchestrator.activeIncentives[this.currentNodeId] || 1.0;
      const tokens = storeData.tokenReward * incentiveMult;

      this.wallet -= price;
      this.tokensEarned += tokens;
      this.purchasesCount++;
      this.cart.push({ store: storeData.name, price: price.toFixed(2), tokens: tokens.toFixed(1) });

      if (store) {
        store.totalSales += price;
        store.totalTokens += tokens;
        store.posQueue.shift();
      }

      // Create transaction
      const tx = new Transaction(this.id, this.currentNodeId, price, tokens);
      orchestrator.enqueueTx(tx);

      // Particle effect trigger
      simulation.addTransactionParticle(this.x * canvasW, this.y * canvasH, this.config.color);

      this.state = "WALKING";
      this.queueTimer = 0;
      this.pickNextDestination(orchestrator);
      return tx;
    }

    // 3. Walking towards target node
    if (this.state === "WALKING") {
      if (!this.targetNodeId) {
        this.pickNextDestination(orchestrator);
      }

      const currNode = MAP_NODES[this.currentNodeId];
      const targetNode = MAP_NODES[this.targetNodeId];

      const stepRate = 0.007 * this.config.speed * simulation.simSpeed;
      this.progress += stepRate;

      // Interpolate coordinates with slight organic jitter
      this.x = currNode.x + (targetNode.x - currNode.x) * this.progress;
      this.y = currNode.y + (targetNode.y - currNode.y) * this.progress;

      if (this.progress >= 1.0) {
        this.currentNodeId = this.targetNodeId;
        this.targetNodeId = null;
        this.progress = 0;
        this.pathHistory.push(this.currentNodeId);

        const arrivedNode = MAP_NODES[this.currentNodeId];
        if (arrivedNode.type === "exit") {
          this.state = "FINISHED";
          return null;
        }

        if (arrivedNode.type === "retail") {
          const store = orchestrator.retailNodes[this.currentNodeId];
          if (store) {
            // Check queue tolerance
            if (store.posQueue.length >= this.config.maxQueueWait) {
              orchestrator.recordCrowdJam(this.currentNodeId);
              this.pickNextDestination(orchestrator);
            } else if (Math.random() < this.config.purchaseProb && this.wallet >= arrivedNode.basePrice) {
              this.state = "QUEUING";
              this.queueTimer = 0;
              store.posQueue.push(this);
            } else {
              this.pickNextDestination(orchestrator);
            }
          }
        } else {
          this.pickNextDestination(orchestrator);
        }
      }
    }

    return null;
  }

  pickNextDestination(orchestrator) {
    const currentNode = MAP_NODES[this.currentNodeId];
    if (!currentNode) return;
    const neighbors = [...currentNode.neighbors];

    // Check if an active incentive node is adjacent!
    if (orchestrator.enableDynamicRerouting) {
      const incentivized = neighbors.filter(n => orchestrator.activeIncentives[n]);
      if (incentivized.length > 0 && Math.random() < this.config.incentiveSensitivity) {
        this.targetNodeId = incentivized[Math.floor(Math.random() * incentivized.length)];
        return;
      }
    }

    // Weighted random selection: bias towards retail or next progress
    this.targetNodeId = neighbors[Math.floor(Math.random() * neighbors.length)];
  }
}

// ==============================================================================
// 5. ORCHESTRATOR & BLOCKCHAIN CONTROLLER
// ==============================================================================

class RetailNodeState {
  constructor(nodeId, data) {
    this.nodeId = nodeId;
    this.name = data.name;
    this.category = data.category;
    this.capacity = data.capacity;
    this.posQueue = [];
    this.totalSales = 0;
    this.totalTokens = 0;
    this.crowdAlertCount = 0;
  }
}

class Orchestrator {
  constructor() {
    this.batchSize = 8;
    this.enableDynamicRerouting = true;
    this.incentiveBoost = 2.0;

    this.mempool = [];
    this.blocks = [];
    this.retailNodes = {};
    this.activeIncentives = {}; // nodeId -> multiplier
    this.crowdJamsAverted = 0;

    // Initialize retail store trackers
    for (const [id, node] of Object.entries(MAP_NODES)) {
      if (node.type === "retail") {
        this.retailNodes[id] = new RetailNodeState(id, node);
      }
    }

    this._createGenesisBlock();
  }

  _createGenesisBlock() {
    const genesis = new RollupBlock(0, [], "0x00000000000000000000000000000000");
    this.blocks.push(genesis);
  }

  enqueueTx(tx) {
    this.mempool.push(tx);
  }

  recordCrowdJam(nodeId) {
    this.crowdJamsAverted++;
    if (this.retailNodes[nodeId]) {
      this.retailNodes[nodeId].crowdAlertCount++;
    }
  }

  step() {
    // 1. Dynamic Crowd Rerouting & Incentive emission
    if (this.enableDynamicRerouting) {
      this.evaluateCongestion();
    } else {
      this.activeIncentives = {};
    }

    // 2. Rollup Batching: check if mempool threshold reached
    if (this.mempool.length >= this.batchSize) {
      const batch = this.mempool.splice(0, this.batchSize);
      const prevBlock = this.blocks[this.blocks.length - 1];
      const newBlock = new RollupBlock(this.blocks.length, batch, prevBlock.blockHash);
      this.blocks.push(newBlock);
      return newBlock;
    }
    return null;
  }

  evaluateCongestion() {
    const congestedNodes = [];
    for (const [id, store] of Object.entries(this.retailNodes)) {
      if (store.posQueue.length >= Math.ceil(store.capacity * 0.4)) {
        congestedNodes.push(id);
      }
    }

    this.activeIncentives = {};
    if (congestedNodes.length > 0) {
      // Find uncongested stores and broadcast 2x token boost
      for (const [id, store] of Object.entries(this.retailNodes)) {
        if (!congestedNodes.includes(id) && store.posQueue.length <= 1) {
          this.activeIncentives[id] = this.incentiveBoost;
        }
      }

      // Show alert in UI
      const congestedName = MAP_NODES[congestedNodes[0]].name;
      const incentivizedNames = Object.keys(this.activeIncentives).map(k => MAP_NODES[k].name);
      if (incentivizedNames.length > 0) {
        simulation.showOrchestratorAlert(
          `Congestion at ${congestedName} (${this.retailNodes[congestedNodes[0]].posQueue.length} in queue). Dynamic ${this.incentiveBoost}x Reward dispatched to ${incentivizedNames[0]}!`
        );
      }
    }
  }
}

// ==============================================================================
// 6. MAIN SIMULATION ENGINE & CANVAS RENDERER
// ==============================================================================

class SimulationApp {
  constructor() {
    this.canvas = document.getElementById("simulation-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.wrapper = document.getElementById("canvas-wrapper");

    this.orchestrator = new Orchestrator();
    this.agents = [];
    this.particles = [];
    this.selectedEntity = null; // Agent or Node

    this.simSpeed = 1.0;
    this.isRunning = true;
    this.tickCount = 0;
    this.targetAgentCount = 50;

    // View layer modes: 'all', 'congestion', 'routes'
    this.viewMode = "all";

    // TPS Tracking
    this.recentTxTimestamps = [];
    this.currentTps = 0;
    this.peakTps = 0;

    this.initCanvasSize();
    this.initAgents();
    this.bindEvents();
    this.startLoop();
  }

  initCanvasSize() {
    const rect = this.wrapper.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
  }

  initAgents() {
    this.agents = [];
    const personas = Object.keys(PERSONA_CONFIGS);
    const weights = [0.40, 0.25, 0.15, 0.20]; // Bargain, Window, Spender, Rush

    for (let i = 0; i < this.targetAgentCount; i++) {
      const rand = Math.random();
      let cumulative = 0;
      let chosenPersona = personas[0];
      for (let j = 0; j < personas.length; j++) {
        cumulative += weights[j];
        if (rand <= cumulative) {
          chosenPersona = personas[j];
          break;
        }
      }
      this.agents.push(new ShopperAgent(`shp_${i.toString().padStart(3, "0")}`, chosenPersona));
    }
  }

  addTransactionParticle(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1.0,
        color: color
      });
    }
  }

  step() {
    this.tickCount++;

    // Step agents
    let newTxCount = 0;
    let activeAgents = 0;
    for (const agent of this.agents) {
      if (agent.state !== "FINISHED") {
        activeAgents++;
        const tx = agent.update(this.orchestrator, this.cssWidth, this.cssHeight);
        if (tx) {
          newTxCount++;
          this.recentTxTimestamps.push(Date.now());
          this.updateActivityStream(`Tx committed: ${agent.id} spent $${tx.amount} at ${MAP_NODES[tx.retailerNodeId].name} (+${tx.tokens} TOKENS)`);
        }
      }
    }

    // Auto replenish agents if too many exit
    if (activeAgents < this.targetAgentCount * 0.4) {
      this.replenishAgents();
    }

    // Step orchestrator
    const committedBlock = this.orchestrator.step();
    if (committedBlock) {
      this.onBlockCommitted(committedBlock);
    }

    // Calculate TPS (window of last 3 seconds)
    const now = Date.now();
    this.recentTxTimestamps = this.recentTxTimestamps.filter(t => (now - t) < 3000);
    this.currentTps = Number((this.recentTxTimestamps.length / 3).toFixed(1));
    if (this.currentTps > this.peakTps) this.peakTps = this.currentTps;

    // Update UI elements periodically
    if (this.tickCount % 5 === 0) {
      this.updateUIMetrics(activeAgents);
    }
  }

  replenishAgents() {
    const deficit = this.targetAgentCount - this.agents.filter(a => a.state !== "FINISHED").length;
    const personas = Object.keys(PERSONA_CONFIGS);
    for (let i = 0; i < deficit; i++) {
      const p = personas[Math.floor(Math.random() * personas.length)];
      this.agents.push(new ShopperAgent(`shp_${(this.agents.length + i).toString().padStart(3, "0")}`, p));
    }
  }

  onBlockCommitted(block) {
    this.renderMempool();
    this.renderBlocks();
    this.updateActivityStream(`⚡ Rollup Block #${block.blockNumber} sealed with ${block.transactions.length} txs! Gas saved: ${block.gasSavedPct.toFixed(1)}%`);
  }

  // ============================================================================
  // CANVAS RENDERING
  // ============================================================================

  render() {
    const ctx = this.ctx;
    const w = this.cssWidth;
    const h = this.cssHeight;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Street Grid Background & Ambient Lines
    this.drawStreetGrid(ctx, w, h);

    // 2. Draw Network Paths & Interconnections
    this.drawPaths(ctx, w, h);

    // 3. Draw Store & Landmark Nodes
    this.drawNodes(ctx, w, h);

    // 4. Draw Animated Shopper Agents
    this.drawAgents(ctx, w, h);

    // 5. Draw Particle Bursts
    this.drawParticles(ctx);

    // 6. Draw Selection Halo if selected
    if (this.selectedEntity) {
      this.drawSelectionHighlight(ctx, w, h);
    }
  }

  drawStreetGrid(ctx, w, h) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  drawPaths(ctx, w, h) {
    const visitedEdges = new Set();

    for (const [id, node] of Object.entries(MAP_NODES)) {
      const x1 = node.x * w;
      const y1 = node.y * h;

      for (const neighborId of node.neighbors) {
        const edgeKey = [id, neighborId].sort().join("---");
        if (visitedEdges.has(edgeKey)) continue;
        visitedEdges.add(edgeKey);

        const neighbor = MAP_NODES[neighborId];
        const x2 = neighbor.x * w;
        const y2 = neighbor.y * h;

        // Base Road Pathway
        ctx.strokeStyle = "rgba(30, 48, 80, 0.6)";
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Inner Pedestrian Glow
        const isIncentiveRoute = (this.orchestrator.activeIncentives[id] || this.orchestrator.activeIncentives[neighborId]);
        ctx.strokeStyle = isIncentiveRoute ? "rgba(245, 158, 11, 0.45)" : "rgba(0, 242, 254, 0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -this.tickCount * 0.8;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  drawNodes(ctx, w, h) {
    for (const [id, node] of Object.entries(MAP_NODES)) {
      const cx = node.x * w;
      const cy = node.y * h;
      const isRetail = node.type === "retail";
      const isPlaza = node.type === "plaza";
      const isEntrance = node.type === "entrance" || node.type === "exit";

      const storeState = this.orchestrator.retailNodes[id];
      const queueLen = storeState ? storeState.posQueue.length : 0;
      const isCongested = storeState && (queueLen >= Math.ceil(node.capacity * 0.4));
      const hasIncentive = this.orchestrator.activeIncentives[id];

      // Outer Pulse Ring if Congested or Incentivized
      if (isCongested) {
        const pulse = 18 + Math.sin(this.tickCount * 0.15) * 5;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
        ctx.fill();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (hasIncentive) {
        const pulse = 18 + Math.sin(this.tickCount * 0.15) * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Base Node Circle
      let nodeRadius = isPlaza ? 24 : (isEntrance ? 18 : 16);
      ctx.beginPath();
      ctx.arc(cx, cy, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = isRetail ? "#111c30" : (isPlaza ? "#0f233a" : "#131b26");
      ctx.fill();
      ctx.strokeStyle = isCongested ? "#ef4444" : (hasIncentive ? "#f59e0b" : "#00f2fe");
      ctx.lineWidth = 2;
      ctx.stroke();

      // Store Icon or Symbol
      ctx.fillStyle = "#ffffff";
      ctx.font = isPlaza ? "14px Inter" : "11px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let icon = "🛍️";
      if (node.category === "footwear") icon = "👟";
      if (node.category === "food") icon = "☕";
      if (node.category === "electronics") icon = "📱";
      if (node.category === "luxury") icon = "💎";
      if (node.category === "apparel") icon = "👗";
      if (node.category === "crafts") icon = "🎨";
      if (isPlaza) icon = "🏛️";
      if (node.type === "entrance") icon = "🚪";
      if (node.type === "exit") icon = "🏁";
      if (node.type === "intersection") icon = "✛";

      ctx.fillText(icon, cx, cy);

      // Node Name Label
      ctx.font = "600 10px Outfit, sans-serif";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(node.name, cx, cy + nodeRadius + 12);

      // Queue & Token Incentive Pill
      if (isRetail && storeState) {
        // Queue Badge
        ctx.fillStyle = isCongested ? "#ef4444" : "rgba(255,255,255,0.7)";
        ctx.font = "500 9px 'JetBrains Mono', monospace";
        ctx.fillText(`Queue: ${queueLen}/${node.capacity}`, cx, cy + nodeRadius + 24);

        // Incentive Badge Floating Above
        if (hasIncentive) {
          ctx.fillStyle = "#f59e0b";
          ctx.font = "700 9px 'JetBrains Mono', monospace";
          ctx.fillText(`⚡ +${hasIncentive}x TOKEN`, cx, cy - nodeRadius - 8);
        }
      }
    }
  }

  drawAgents(ctx, w, h) {
    for (const agent of this.agents) {
      if (agent.state === "FINISHED") continue;

      const px = agent.x * w;
      const py = agent.y * h;

      // Glow halo
      ctx.beginPath();
      ctx.arc(px, py, agent.radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = agent.config.color + "33"; // 20% opacity
      ctx.fill();

      // Main Agent Circle
      ctx.beginPath();
      ctx.arc(px, py, agent.radius, 0, Math.PI * 2);
      ctx.fillStyle = agent.config.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      // If waiting in queue, show hourglass indicator
      if (agent.state === "QUEUING") {
        ctx.fillStyle = "#fbbf24";
        ctx.font = "8px Inter";
        ctx.fillText("⏳", px, py - 8);
      }
    }
  }

  drawParticles(ctx) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  drawSelectionHighlight(ctx, w, h) {
    const e = this.selectedEntity;
    let sx = 0, sy = 0, sRadius = 25;

    if (e.type === "agent") {
      sx = e.data.x * w;
      sy = e.data.y * h;
      sRadius = 14;
    } else if (e.type === "node") {
      const node = MAP_NODES[e.data.id];
      sx = node.x * w;
      sy = node.y * h;
      sRadius = 30;
    }

    ctx.strokeStyle = "#00f2fe";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ============================================================================
  // UI SYNCHRONIZATION & METRICS
  // ============================================================================

  updateUIMetrics(activeAgents) {
    // Header KPIs
    document.getElementById("metric-tps").innerText = this.currentTps.toFixed(1);
    document.getElementById("metric-tps-peak").innerText = `Peak: ${this.peakTps.toFixed(1)} TPS`;

    const totalBlocks = this.orchestrator.blocks.length - 1;
    const avgGasSaved = totalBlocks > 0 
      ? (this.orchestrator.blocks.slice(1).reduce((acc, b) => acc + b.gasSavedPct, 0) / totalBlocks).toFixed(1)
      : "0";
    document.getElementById("metric-gas-savings").innerText = `${avgGasSaved}%`;
    document.getElementById("metric-rollup-batches").innerText = `${totalBlocks} Rollup Batches`;

    document.getElementById("metric-mempool-count").innerText = this.orchestrator.mempool.length;
    document.getElementById("metric-batch-threshold").innerText = `Target: ${this.orchestrator.batchSize} txs/block`;

    // Congestion Index
    let totalQueue = 0;
    let totalCap = 0;
    for (const [id, store] of Object.entries(this.orchestrator.retailNodes)) {
      totalQueue += store.posQueue.length;
      totalCap += store.capacity;
    }
    const congestionPct = totalCap > 0 ? Math.round((totalQueue / totalCap) * 100) : 0;
    const congestionBadge = document.getElementById("metric-congestion");
    const activeIncentiveCount = Object.keys(this.orchestrator.activeIncentives).length;
    document.getElementById("metric-active-incentives").innerText = `Incentives Active: ${activeIncentiveCount}`;

    if (congestionPct < 25) {
      congestionBadge.innerText = `LOW (${congestionPct}%)`;
      congestionBadge.className = "metric-value highlight-cyan";
    } else if (congestionPct < 55) {
      congestionBadge.innerText = `MODERATE (${congestionPct}%)`;
      congestionBadge.className = "metric-value highlight-amber";
    } else {
      congestionBadge.innerText = `HIGH (${congestionPct}%)`;
      congestionBadge.className = "metric-value highlight-crimson";
    }

    // Viewport stats
    document.getElementById("stat-tick-counter").innerText = `Tick: ${this.tickCount.toString().padStart(3, "0")}`;
    document.getElementById("stat-active-shoppers").innerText = `Active Shoppers: ${activeAgents}`;
    document.getElementById("stat-crowd-diverted").innerText = `Rerouted: ${this.orchestrator.crowdJamsAverted}`;

    const totalSales = Object.values(this.orchestrator.retailNodes).reduce((a, b) => a + b.totalSales, 0);
    document.getElementById("stat-settled-sales").innerText = `Settled: $${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    this.renderMempool();
    this.renderStoreCards();
    if (this.selectedEntity) {
      this.renderInspector();
    }
  }

  renderMempool() {
    const list = document.getElementById("mempool-list");
    const badge = document.getElementById("mempool-badge-count");
    const pool = this.orchestrator.mempool;
    badge.innerText = `${pool.length} pending`;

    if (pool.length === 0) {
      list.innerHTML = `<div class="empty-state">Waiting for store POS transactions...</div>`;
      return;
    }

    list.innerHTML = pool.slice(0, 10).map(tx => {
      const storeName = MAP_NODES[tx.retailerNodeId] ? MAP_NODES[tx.retailerNodeId].name : tx.retailerNodeId;
      return `
        <div class="mempool-item">
          <div>
            <div class="tx-store">${storeName}</div>
            <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-dim);">${tx.txId}</div>
          </div>
          <div style="text-align: right;">
            <div class="tx-amount">$${tx.amount.toFixed(2)}</div>
            <div class="tx-tokens">+${tx.tokens} TOKENS</div>
          </div>
        </div>
      `;
    }).join("");
  }

  renderBlocks() {
    const stream = document.getElementById("block-stream");
    const badge = document.getElementById("blocks-badge-count");
    const blocks = this.orchestrator.blocks.slice(1).reverse(); // latest first
    badge.innerText = `${blocks.length} blocks`;

    stream.innerHTML = blocks.map(b => `
      <div class="block-card" onclick="simulation.openBlockModal(${b.blockNumber})">
        <div class="block-card-header">
          <span class="block-num">Block #${b.blockNumber}</span>
          <span class="block-gas-badge">⚡ ${b.gasSavedPct.toFixed(1)}% GAS SAVED</span>
        </div>
        <div class="block-hash">Merkle: ${b.merkleRoot}</div>
        <div class="block-footer">
          <span>📦 ${b.transactions.length} Txs</span>
          <span>${b.timestamp.toLocaleTimeString()}</span>
        </div>
      </div>
    `).join("");
  }

  renderStoreCards() {
    const container = document.getElementById("retail-nodes-list");
    if (!container) return;

    container.innerHTML = Object.entries(this.orchestrator.retailNodes).map(([id, store]) => {
      const nodeData = MAP_NODES[id];
      const qLen = store.posQueue.length;
      const pct = Math.min(100, Math.round((qLen / nodeData.capacity) * 100));
      const isCongested = qLen >= Math.ceil(nodeData.capacity * 0.4);
      const hasIncentive = this.orchestrator.activeIncentives[id];

      return `
        <div class="node-card" style="cursor: pointer;" onclick="simulation.selectNode('${id}')">
          <div class="node-card-header">
            <div>
              <div class="node-name">${store.name}</div>
              <div class="node-category">${store.category} • Base $${nodeData.basePrice}</div>
            </div>
            ${hasIncentive ? `<span class="badge-count" style="color: var(--accent-amber); border-color: var(--accent-amber);">+${hasIncentive}x TOKEN</span>` : ''}
          </div>
          <div class="capacity-bar-container">
            <div class="capacity-bar-fill ${isCongested ? 'congested' : ''}" style="width: ${pct}%"></div>
          </div>
          <div class="node-metrics-row">
            <span>Queue: ${qLen}/${nodeData.capacity} (${pct}%)</span>
            <span>Sales: $${store.totalSales.toFixed(2)}</span>
            <span>Tokens: ${store.totalTokens.toFixed(0)}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  selectNode(nodeId) {
    const store = this.orchestrator.retailNodes[nodeId];
    if (!store) return;
    this.selectedEntity = { type: "node", data: store };
    this.switchTab("agent");
    this.renderInspector();
  }

  selectAgent(agent) {
    this.selectedEntity = { type: "agent", data: agent };
    this.switchTab("agent");
    this.renderInspector();
  }

  renderInspector() {
    const card = document.getElementById("inspector-details");
    const title = document.getElementById("inspector-title");
    const typeBadge = document.getElementById("inspector-type");

    if (!this.selectedEntity) return;

    if (this.selectedEntity.type === "agent") {
      const a = this.selectedEntity.data;
      title.innerText = `Shopper ${a.id}`;
      typeBadge.innerText = a.personaName;
      typeBadge.style.color = a.config.color;

      card.innerHTML = `
        <div class="inspector-row">
          <span class="inspector-key">Persona Type</span>
          <span class="inspector-val" style="color: ${a.config.color};">${a.personaName}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Wallet Balance</span>
          <span class="inspector-val highlight-emerald">$${a.wallet.toFixed(2)} / $${a.initialWallet.toFixed(2)}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Loyalty Tokens</span>
          <span class="inspector-val highlight-amber">${a.tokensEarned.toFixed(1)} TOKENS</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Current State</span>
          <span class="inspector-val">${a.state}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Current Location</span>
          <span class="inspector-val">${MAP_NODES[a.currentNodeId]?.name || a.currentNodeId}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Incentive Sensitivity</span>
          <span class="inspector-val">${(a.config.incentiveSensitivity * 100).toFixed(0)}%</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Queue Tolerance</span>
          <span class="inspector-val">Max ${a.config.maxQueueWait} people</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Shopping Cart (${a.cart.length} items)</span>
          <span class="inspector-val">${a.cart.length > 0 ? a.cart.map(c => c.store).join(", ") : "Empty"}</span>
        </div>
      `;
    } else if (this.selectedEntity.type === "node") {
      const s = this.selectedEntity.data;
      const nodeData = MAP_NODES[s.nodeId];
      title.innerText = s.name;
      typeBadge.innerText = "Retail POS Node";
      typeBadge.style.color = "var(--accent-cyan)";

      card.innerHTML = `
        <div class="inspector-row">
          <span class="inspector-key">Category</span>
          <span class="inspector-val">${s.category.toUpperCase()}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Max Capacity</span>
          <span class="inspector-val">${nodeData.capacity} shoppers</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Current POS Queue</span>
          <span class="inspector-val ${s.posQueue.length > 3 ? 'highlight-crimson' : 'highlight-cyan'}">${s.posQueue.length} customers</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Total Sales Volume</span>
          <span class="inspector-val highlight-emerald">$${s.totalSales.toFixed(2)}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Tokens Minted</span>
          <span class="inspector-val highlight-amber">${s.totalTokens.toFixed(1)} TOKENS</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Active Incentive Boost</span>
          <span class="inspector-val">${this.orchestrator.activeIncentives[s.nodeId] ? `⚡ ${this.orchestrator.activeIncentives[s.nodeId]}x Active` : "Standard (1.0x)"}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-key">Congestion Alerts Triggered</span>
          <span class="inspector-val">${s.crowdAlertCount} times</span>
        </div>
      `;
    }
  }

  showOrchestratorAlert(message) {
    const banner = document.getElementById("orchestrator-alert");
    const body = document.getElementById("alert-body");
    body.innerText = message;
    banner.style.display = "flex";

    clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => {
      banner.style.display = "none";
    }, 4500);
  }

  updateActivityStream(text) {
    const stream = document.getElementById("stream-text");
    stream.innerText = text;
  }

  switchTab(tabKey) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

    const btn = document.getElementById(`tab-btn-${tabKey}`);
    const content = document.getElementById(`tab-content-${tabKey}`);
    if (btn) btn.classList.add("active");
    if (content) content.classList.add("active");
  }

  openBlockModal(blockNum) {
    const block = this.orchestrator.blocks[blockNum];
    if (!block) return;

    const modal = document.getElementById("block-modal");
    const title = document.getElementById("modal-block-title");
    const content = document.getElementById("modal-block-content");

    title.innerText = `Rollup Block #${block.blockNumber} Cryptographic Explorer`;
    content.innerHTML = `
      <div class="inspector-row">
        <span class="inspector-key">Block Hash:</span>
        <span class="inspector-val" style="word-break: break-all;">${block.blockHash}</span>
      </div>
      <div class="inspector-row">
        <span class="inspector-key">Merkle Root:</span>
        <span class="inspector-val" style="word-break: break-all;">${block.merkleRoot}</span>
      </div>
      <div class="inspector-row">
        <span class="inspector-key">Previous Hash:</span>
        <span class="inspector-val" style="word-break: break-all;">${block.prevHash}</span>
      </div>
      <div class="inspector-row">
        <span class="inspector-key">Timestamp:</span>
        <span class="inspector-val">${block.timestamp.toISOString()}</span>
      </div>
      <div class="inspector-row">
        <span class="inspector-key">L1 Gas Saved:</span>
        <span class="inspector-val highlight-emerald">${block.gasSavedPct.toFixed(1)}% Compression</span>
      </div>
      <div class="modal-section-title">Transactions Included (${block.transactions.length})</div>
      <table class="tx-table">
        <thead>
          <tr>
            <th>Tx ID</th>
            <th>Shopper</th>
            <th>Store</th>
            <th>USD Amount</th>
            <th>Tokens Minted</th>
          </tr>
        </thead>
        <tbody>
          ${block.transactions.map(t => `
            <tr>
              <td>${t.txId.slice(0, 10)}...</td>
              <td>${t.shopperId}</td>
              <td>${MAP_NODES[t.retailerNodeId]?.name || t.retailerNodeId}</td>
              <td style="color: var(--accent-emerald);">$${t.amount.toFixed(2)}</td>
              <td style="color: var(--accent-amber);">+${t.tokens}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    modal.style.display = "flex";
  }

  // ============================================================================
  // EVENT HANDLERS & STRESS TESTS
  // ============================================================================

  bindEvents() {
    window.addEventListener("resize", () => this.initCanvasSize());

    // Play/Pause
    const playBtn = document.getElementById("btn-toggle-play");
    playBtn.addEventListener("click", () => {
      this.isRunning = !this.isRunning;
      document.getElementById("play-pause-icon").innerText = this.isRunning ? "⏸" : "▶";
      document.getElementById("play-pause-label").innerText = this.isRunning ? "Pause" : "Play";
      const statusIndicator = document.getElementById("sim-status-indicator");
      if (this.isRunning) {
        statusIndicator.innerText = "LIVE";
        statusIndicator.className = "status-indicator live";
      } else {
        statusIndicator.innerText = "PAUSED";
        statusIndicator.className = "status-indicator paused";
      }
    });

    // Reset
    document.getElementById("btn-reset-sim").addEventListener("click", () => {
      this.orchestrator = new Orchestrator();
      this.tickCount = 0;
      this.recentTxTimestamps = [];
      this.currentTps = 0;
      this.peakTps = 0;
      this.initAgents();
      this.renderMempool();
      this.renderBlocks();
      this.updateActivityStream("Simulation environment reset.");
    });

    // Speed Slider
    const speedSlider = document.getElementById("slider-speed");
    speedSlider.addEventListener("input", (e) => {
      this.simSpeed = parseFloat(e.target.value);
      document.getElementById("val-speed").innerText = `${this.simSpeed.toFixed(1)}x`;
    });

    // Agent Count Slider
    const agentSlider = document.getElementById("slider-agent-count");
    agentSlider.addEventListener("input", (e) => {
      this.targetAgentCount = parseInt(e.target.value, 10);
      document.getElementById("val-agent-count").innerText = this.targetAgentCount;
      this.replenishAgents();
    });

    // Dynamic Rerouting Toggle
    const rerouteToggle = document.getElementById("toggle-dynamic-reroute");
    rerouteToggle.addEventListener("change", (e) => {
      this.orchestrator.enableDynamicRerouting = e.target.checked;
      this.updateActivityStream(`Orchestrator Dynamic Rerouting ${e.target.checked ? "ENABLED" : "DISABLED"}`);
    });

    // Batch Size Slider
    const batchSlider = document.getElementById("slider-batch-size");
    batchSlider.addEventListener("input", (e) => {
      this.orchestrator.batchSize = parseInt(e.target.value, 10);
      document.getElementById("val-batch-size").innerText = `${this.orchestrator.batchSize} txs`;
    });

    // Incentive Multiplier Slider
    const incSlider = document.getElementById("slider-incentive-boost");
    incSlider.addEventListener("input", (e) => {
      this.orchestrator.incentiveBoost = parseFloat(e.target.value);
      document.getElementById("val-incentive-boost").innerText = `${this.orchestrator.incentiveBoost.toFixed(1)}x`;
    });

    // Tabs
    document.getElementById("tab-btn-chain").addEventListener("click", () => this.switchTab("chain"));
    document.getElementById("tab-btn-stores").addEventListener("click", () => this.switchTab("stores"));
    document.getElementById("tab-btn-agent").addEventListener("click", () => this.switchTab("agent"));

    // Modal Close
    document.getElementById("modal-close-btn").addEventListener("click", () => {
      document.getElementById("block-modal").style.display = "none";
    });
    document.getElementById("block-modal").addEventListener("click", (e) => {
      if (e.target.id === "block-modal") {
        document.getElementById("block-modal").style.display = "none";
      }
    });

    // Stress Test Buttons
    document.getElementById("btn-stress-flash-sale").addEventListener("click", () => {
      // Direct high spenders to Royal Jewelry Vault!
      this.updateActivityStream("🔥 STRESS TEST: Flash Sale triggered at Royal Jewelry Vault! High Spenders rushing...");
      for (let i = 0; i < 15; i++) {
        const agent = new ShopperAgent(`vip_${i}`, "High Spender");
        agent.targetNodeId = "Royal_Jewelry_Vault";
        this.agents.push(agent);
      }
    });

    document.getElementById("btn-stress-rush-hour").addEventListener("click", () => {
      this.updateActivityStream("🚶‍♂️ STRESS TEST: Rush Hour traffic surge (+25 Shoppers entering Commercial St)");
      for (let i = 0; i < 25; i++) {
        this.agents.push(new ShopperAgent(`rush_${i}`, "Rush Shopper"));
      }
    });

    document.getElementById("btn-stress-choke").addEventListener("click", () => {
      this.updateActivityStream("⚠️ STRESS TEST: POS Network latency spike at Shoe Haven Bazaar! Testing Orchestrator Reroute...");
      const store = this.orchestrator.retailNodes["Shoe_Haven_Bazaar"];
      if (store) {
        // Artificially inflate queue to trigger orchestrator rerouting alert
        for (let i = 0; i < 8; i++) {
          store.posQueue.push(new ShopperAgent(`choke_${i}`, "Bargain Hunter"));
        }
      }
    });

    document.getElementById("btn-stress-monsoon").addEventListener("click", () => {
      this.updateActivityStream("🌧 STRESS TEST: Monsoon rain begins. Shoppers heading to Street Coffee & Chai!");
      for (const a of this.agents) {
        if (a.state === "WALKING") a.targetNodeId = "Street_Chai_Cafe";
      }
    });

    // Canvas Click Inspector
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / rect.width;
      const clickY = (e.clientY - rect.top) / rect.height;

      // Check if clicked near a node
      for (const [id, node] of Object.entries(MAP_NODES)) {
        const dist = Math.hypot(clickX - node.x, clickY - node.y);
        if (dist < 0.05) {
          this.selectNode(id);
          return;
        }
      }

      // Check if clicked near an agent
      for (const agent of this.agents) {
        if (agent.state === "FINISHED") continue;
        const dist = Math.hypot(clickX - agent.x, clickY - agent.y);
        if (dist < 0.035) {
          this.selectAgent(agent);
          return;
        }
      }
    });

    // Canvas Hover Tooltip
    const tooltip = document.getElementById("canvas-tooltip");
    const tipTitle = document.getElementById("tooltip-title");
    const tipContent = document.getElementById("tooltip-content");

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const hoverX = (e.clientX - rect.left) / rect.width;
      const hoverY = (e.clientY - rect.top) / rect.height;

      let found = false;
      for (const [id, node] of Object.entries(MAP_NODES)) {
        const dist = Math.hypot(hoverX - node.x, hoverY - node.y);
        if (dist < 0.05) {
          tooltip.style.left = `${e.clientX - rect.left}px`;
          tooltip.style.top = `${e.clientY - rect.top}px`;
          tooltip.style.display = "block";
          tipTitle.innerText = node.name;
          const store = this.orchestrator.retailNodes[id];
          if (store) {
            tipContent.innerText = `Category: ${store.category}\nQueue: ${store.posQueue.length}/${node.capacity}\nSales: $${store.totalSales.toFixed(2)}`;
          } else {
            tipContent.innerText = `Type: ${node.type.toUpperCase()}`;
          }
          found = true;
          break;
        }
      }

      if (!found) {
        tooltip.style.display = "none";
      }
    });

    this.canvas.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  }

  startLoop() {
    const loop = () => {
      if (this.isRunning) {
        this.step();
      }
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Global instance initiation
let simulation;
window.addEventListener("DOMContentLoaded", () => {
  simulation = new SimulationApp();
});
