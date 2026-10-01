"""
Commercial Street Multi-Agent Blockchain Retail Network Simulator
==================================================================
A high-throughput Multi-Agent Simulation (MAS) designed to stress-test
a blockchain retail orchestrator handling erratic shopper foot-traffic,
store point-of-sale (POS) congestion, and Layer-2 transaction rollup batching
on Bangalore's Commercial Street.

Architecture:
  - ShopperAgent: Simulates realistic human behavior (Bargain Hunter, Window Shopper, High Spender, Rush Shopper)
  - RetailerNode: Simulates physical store POS nodes with queue limits, token minting, and inventory
  - Orchestrator: Central coordinator testing dynamic crowd load-balancing, incentive broadcasting,
                  and transaction rollup batching (saving gas fees)
  - BlockchainLedger: Simulated blockchain tracking Merkle-hashed blocks, gas metrics, and receipts.
"""

import time
import random
import hashlib
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple

# ==============================================================================
# 1. MAP GRAPH TOPOLOGY (Commercial Street, Bangalore)
# ==============================================================================

COMMERCIAL_STREET_GRAPH: Dict[str, Dict] = {
    "Tasker_Town_Entrance": {
        "name": "Tasker Town Entrance",
        "type": "entrance",
        "neighbors": ["Dispensary_Rd_Junction", "Shoe_Haven_Bazaar"],
        "coords": (50, 200),
        "capacity": 100
    },
    "Dispensary_Rd_Junction": {
        "name": "Dispensary Road Junction",
        "type": "intersection",
        "neighbors": ["Tasker_Town_Entrance", "Central_Pedestrian_Plaza", "Street_Chai_Cafe"],
        "coords": (180, 160),
        "capacity": 80
    },
    "Shoe_Haven_Bazaar": {
        "name": "Shoe Haven Bazaar",
        "type": "retail",
        "category": "footwear",
        "neighbors": ["Tasker_Town_Entrance", "Central_Pedestrian_Plaza", "Heritage_Artisan_Alley"],
        "coords": (160, 280),
        "capacity": 25,
        "base_price": 40,
        "token_reward": 5
    },
    "Central_Pedestrian_Plaza": {
        "name": "Central Pedestrian Plaza",
        "type": "plaza",
        "neighbors": ["Dispensary_Rd_Junction", "Shoe_Haven_Bazaar", "Mysore_Silk_Emporium", "Royal_Jewelry_Vault", "Ibrahim_Sahib_St"],
        "coords": (320, 200),
        "capacity": 120
    },
    "Street_Chai_Cafe": {
        "name": "Street Coffee & Chai",
        "type": "retail",
        "category": "food",
        "neighbors": ["Dispensary_Rd_Junction", "Tech_Frontier"],
        "coords": (260, 80),
        "capacity": 20,
        "base_price": 8,
        "token_reward": 2
    },
    "Mysore_Silk_Emporium": {
        "name": "Mysore Silk Emporium",
        "type": "retail",
        "category": "apparel",
        "neighbors": ["Central_Pedestrian_Plaza", "Royal_Jewelry_Vault", "MG_Road_Exit"],
        "coords": (440, 120),
        "capacity": 30,
        "base_price": 75,
        "token_reward": 12
    },
    "Royal_Jewelry_Vault": {
        "name": "Royal Jewelry Vault",
        "type": "retail",
        "category": "luxury",
        "neighbors": ["Central_Pedestrian_Plaza", "Mysore_Silk_Emporium", "MG_Road_Exit"],
        "coords": (460, 240),
        "capacity": 18,
        "base_price": 150,
        "token_reward": 25
    },
    "Tech_Frontier": {
        "name": "Tech Frontier Gadgets",
        "type": "retail",
        "category": "electronics",
        "neighbors": ["Street_Chai_Cafe", "Ibrahim_Sahib_St"],
        "coords": (380, 50),
        "capacity": 22,
        "base_price": 60,
        "token_reward": 8
    },
    "Ibrahim_Sahib_St": {
        "name": "Ibrahim Sahib Street",
        "type": "intersection",
        "neighbors": ["Tech_Frontier", "Central_Pedestrian_Plaza", "MG_Road_Exit"],
        "coords": (480, 80),
        "capacity": 70
    },
    "Heritage_Artisan_Alley": {
        "name": "Heritage Artisan Alley",
        "type": "retail",
        "category": "crafts",
        "neighbors": ["Shoe_Haven_Bazaar", "MG_Road_Exit"],
        "coords": (300, 330),
        "capacity": 20,
        "base_price": 25,
        "token_reward": 6
    },
    "MG_Road_Exit": {
        "name": "MG Road South Exit",
        "type": "exit",
        "neighbors": ["Mysore_Silk_Emporium", "Royal_Jewelry_Vault", "Heritage_Artisan_Alley", "Ibrahim_Sahib_St"],
        "coords": (600, 200),
        "capacity": 100
    }
}


# ==============================================================================
# 2. BLOCKCHAIN DATA STRUCTURES & MERKLE BATCHER
# ==============================================================================

@dataclass
class Transaction:
    tx_id: str
    shopper_id: str
    retailer_node: str
    amount_usd: float
    loyalty_tokens: float
    timestamp: float
    signature: str = ""
    gas_cost_l1: int = 21000  # standard L1 gas units
    gas_cost_rollup: int = 3500 # batched compressed calldata gas

    def __post_init__(self):
        if not self.signature:
            payload = f"{self.tx_id}:{self.shopper_id}:{self.retailer_node}:{self.amount_usd}:{self.timestamp}"
            self.signature = hashlib.sha256(payload.encode()).hexdigest()[:16]

@dataclass
class RollupBlock:
    block_number: int
    transactions: List[Transaction]
    merkle_root: str
    prev_hash: str
    timestamp: float
    gas_saved_pct: float
    block_hash: str = ""

    def __post_init__(self):
        data = f"{self.block_number}:{self.merkle_root}:{self.prev_hash}:{self.timestamp}"
        self.block_hash = hashlib.sha256(data.encode()).hexdigest()

class BlockchainLedger:
    def __init__(self):
        self.chain: List[RollupBlock] = []
        self.total_transactions = 0
        self.total_usd_volume = 0.0
        self.total_tokens_minted = 0.0
        self.total_l1_gas_hypothetical = 0
        self.total_rollup_gas_actual = 0
        self._create_genesis_block()

    def _create_genesis_block(self):
        genesis = RollupBlock(
            block_number=0,
            transactions=[],
            merkle_root="0x0000000000000000000000000000000000000000000000000000000000000000",
            prev_hash="0x0",
            timestamp=time.time(),
            gas_saved_pct=0.0
        )
        self.chain.append(genesis)

    def calculate_merkle_root(self, txs: List[Transaction]) -> str:
        if not txs:
            return hashlib.sha256(b"empty").hexdigest()
        hashes = [hashlib.sha256(t.signature.encode()).hexdigest() for t in txs]
        while len(hashes) > 1:
            if len(hashes) % 2 != 0:
                hashes.append(hashes[-1])
            new_level = []
            for i in range(0, len(hashes), 2):
                combined = hashes[i] + hashes[i+1]
                new_level.append(hashlib.sha256(combined.encode()).hexdigest())
            hashes = new_level
        return "0x" + hashes[0]

    def commit_block(self, transactions: List[Transaction]) -> RollupBlock:
        if not transactions:
            raise ValueError("Cannot commit empty block")

        merkle_root = self.calculate_merkle_root(transactions)
        prev_hash = self.chain[-1].block_hash

        l1_gas = sum(tx.gas_cost_l1 for tx in transactions)
        # Rollup gas: base overhead + compressed calldata
        rollup_gas = 50000 + sum(tx.gas_cost_rollup for tx in transactions)
        gas_saved_pct = ((l1_gas - rollup_gas) / l1_gas) * 100 if l1_gas > 0 else 0

        block = RollupBlock(
            block_number=len(self.chain),
            transactions=transactions,
            merkle_root=merkle_root,
            prev_hash=prev_hash,
            timestamp=time.time(),
            gas_saved_pct=max(0.0, gas_saved_pct)
        )
        self.chain.append(block)

        self.total_transactions += len(transactions)
        self.total_usd_volume += sum(tx.amount_usd for tx in transactions)
        self.total_tokens_minted += sum(tx.loyalty_tokens for tx in transactions)
        self.total_l1_gas_hypothetical += l1_gas
        self.total_rollup_gas_actual += rollup_gas

        return block


# ==============================================================================
# 3. AGENT DEFINITIONS
# ==============================================================================

PERSONA_PROFILES = {
    "Bargain Hunter": {
        "budget_range": (60, 150),
        "incentive_sensitivity": 0.95,  # Almost always diverts to +2x reward stores
        "purchase_prob": 0.70,
        "max_queue_tolerance": 4,
        "speed": 1
    },
    "Window Shopper": {
        "budget_range": (30, 80),
        "incentive_sensitivity": 0.40,
        "purchase_prob": 0.25,
        "max_queue_tolerance": 2,
        "speed": 1
    },
    "High Spender": {
        "budget_range": (250, 600),
        "incentive_sensitivity": 0.20,
        "purchase_prob": 0.85,
        "max_queue_tolerance": 7,
        "speed": 2
    },
    "Rush Shopper": {
        "budget_range": (80, 200),
        "incentive_sensitivity": 0.60,
        "purchase_prob": 0.90,
        "max_queue_tolerance": 2, # Will abandon store if congested
        "speed": 2
    }
}

class ShopperAgent:
    def __init__(self, agent_id: str, persona: str = "Bargain Hunter"):
        self.agent_id = agent_id
        self.persona = persona
        self.profile = PERSONA_PROFILES[persona]
        self.wallet_balance = float(random.randint(*self.profile["budget_range"]))
        self.initial_budget = self.wallet_balance
        self.loyalty_tokens_earned = 0.0
        self.current_location = "Tasker_Town_Entrance"
        self.destination: Optional[str] = None
        self.status = "WALKING" # WALKING, QUEUING, TRANSACTING, FINISHED
        self.steps_taken = 0
        self.purchases_made = 0
        self.ticks_in_queue = 0

    def step(self, orchestrator: "Orchestrator") -> Optional[Transaction]:
        self.steps_taken += 1

        if self.wallet_balance <= 5:
            self.status = "FINISHED"
            return None

        if self.status == "FINISHED":
            return None

        # 1. If currently inside a store queuing or transacting
        if self.status in ["QUEUING", "TRANSACTING"]:
            return self._handle_store_interaction(orchestrator)

        # 2. Movement logic: Decide next node
        return self._move_and_evaluate(orchestrator)

    def _move_and_evaluate(self, orchestrator: "Orchestrator") -> Optional[Transaction]:
        current_node_data = COMMERCIAL_STREET_GRAPH[self.current_location]
        neighbors = current_node_data["neighbors"]

        # Check for Orchestrator active incentive rerouting!
        # If an active incentive exists nearby and agent is sensitive, prioritize that branch
        incentivized_targets = [
            n for n in neighbors 
            if n in orchestrator.active_incentives 
            and random.random() < self.profile["incentive_sensitivity"]
        ]

        if incentivized_targets:
            next_node = random.choice(incentivized_targets)
        else:
            # Weighted random walk towards exit or retail shops
            retail_neighbors = [n for n in neighbors if COMMERCIAL_STREET_GRAPH[n]["type"] == "retail"]
            if retail_neighbors and random.random() < 0.65:
                next_node = random.choice(retail_neighbors)
            else:
                next_node = random.choice(neighbors)

        self.current_location = next_node
        target_info = COMMERCIAL_STREET_GRAPH[next_node]

        # If it's the exit node, agent completes shopping
        if target_info["type"] == "exit":
            self.status = "FINISHED"
            return None

        # If reached a retail shop, decide whether to enter and transact
        if target_info["type"] == "retail":
            retailer = orchestrator.retailers[next_node]
            current_queue = len(retailer.pos_queue)

            # Check queue tolerance
            if current_queue >= self.profile["max_queue_tolerance"]:
                # Too crowded! Orchestrator alert triggers or agent bails
                orchestrator.record_congestion_rejection(next_node)
                return None

            # Check purchase probability and wallet balance
            base_price = target_info.get("base_price", 20)
            if self.wallet_balance >= base_price and random.random() < self.profile["purchase_prob"]:
                self.status = "QUEUING"
                retailer.pos_queue.append(self)
                return None

        return None

    def _handle_store_interaction(self, orchestrator: "Orchestrator") -> Optional[Transaction]:
        retailer = orchestrator.retailers[self.current_location]
        self.ticks_in_queue += 1

        # Check if agent has reached the front of the POS queue
        if retailer.pos_queue and retailer.pos_queue[0].agent_id == self.agent_id:
            # Process transaction!
            target_info = COMMERCIAL_STREET_GRAPH[self.current_location]
            base_price = target_info.get("base_price", 20)
            multiplier = random.uniform(0.8, 1.4)
            tx_amount = min(self.wallet_balance, round(base_price * multiplier, 2))

            # Calculate loyalty tokens with orchestrator incentive boost
            base_token_reward = target_info.get("token_reward", 5)
            incentive_boost = orchestrator.active_incentives.get(self.current_location, 1.0)
            tokens_minted = round(base_token_reward * incentive_boost, 2)

            self.wallet_balance -= tx_amount
            self.loyalty_tokens_earned += tokens_minted
            self.purchases_made += 1

            # Remove from queue
            retailer.pos_queue.pop(0)
            self.status = "WALKING"

            # Create blockchain transaction object
            tx = Transaction(
                tx_id=f"tx_{int(time.time()*1000)}_{self.agent_id}_{random.randint(100, 999)}",
                shopper_id=self.agent_id,
                retailer_node=self.current_location,
                amount_usd=tx_amount,
                loyalty_tokens=tokens_minted,
                timestamp=time.time()
            )
            retailer.total_sales_volume += tx_amount
            retailer.total_tokens_minted += tokens_minted
            return tx

        return None


class RetailerNode:
    def __init__(self, node_id: str, config: Dict):
        self.node_id = node_id
        self.name = config["name"]
        self.category = config.get("category", "general")
        self.capacity = config.get("capacity", 20)
        self.pos_queue: List[ShopperAgent] = []
        self.total_sales_volume = 0.0
        self.total_tokens_minted = 0.0
        self.congestion_events = 0


# ==============================================================================
# 4. ORCHESTRATOR (The System Under Test)
# ==============================================================================

class Orchestrator:
    def __init__(self, batch_size: int = 10, enable_dynamic_rerouting: bool = True):
        self.batch_size = batch_size
        self.enable_dynamic_rerouting = enable_dynamic_rerouting
        self.mempool: List[Transaction] = []
        self.blockchain = BlockchainLedger()
        self.retailers: Dict[str, RetailerNode] = {}
        self.active_incentives: Dict[str, float] = {}  # node_id -> token_multiplier
        self.congestion_rejections = 0
        self.total_batches_committed = 0
        self.congestion_history: List[Dict[str, int]] = []

        # Initialize retailer nodes
        for node_id, config in COMMERCIAL_STREET_GRAPH.items():
            if config["type"] == "retail":
                self.retailers[node_id] = RetailerNode(node_id, config)

    def record_congestion_rejection(self, node_id: str):
        self.congestion_rejections += 1
        if node_id in self.retailers:
            self.retailers[node_id].congestion_events += 1

    def queue_transaction(self, tx: Transaction):
        self.mempool.append(tx)

    def process_tick(self) -> Optional[RollupBlock]:
        """
        Runs orchestrator periodic logic:
          1. Dynamic Map Rerouting & Incentive broadcasts if congestion detected
          2. Rolls up transactions into L2 block if batch size threshold reached
        """
        # 1. Congestion Load Balancing & Dynamic Rerouting
        if self.enable_dynamic_rerouting:
            self._evaluate_congestion_and_dispatch_incentives()

        # 2. Blockchain Batching & Rollup Commit
        if len(self.mempool) >= self.batch_size:
            batch = self.mempool[:self.batch_size]
            self.mempool = self.mempool[self.batch_size:]
            block = self.blockchain.commit_block(batch)
            self.total_batches_committed += 1
            return block

        return None

    def _evaluate_congestion_and_dispatch_incentives(self):
        """
        If a retailer queue exceeds 60% capacity, orchestrator marks it congested
        and broadcasts a 2.0x loyalty reward multiplier to neighboring less-congested shops!
        """
        self.active_incentives.clear()
        congested_nodes = []

        for node_id, retailer in self.retailers.items():
            queue_len = len(retailer.pos_queue)
            if queue_len >= (retailer.capacity * 0.4): # Congestion threshold
                congested_nodes.append(node_id)

        if congested_nodes:
            # Find low-traffic alternative retail nodes to divert shoppers
            for node_id, retailer in self.retailers.items():
                if node_id not in congested_nodes and len(retailer.pos_queue) <= 1:
                    # Broadcast 2x token incentive drop
                    self.active_incentives[node_id] = 2.0

    def force_flush_mempool(self) -> Optional[RollupBlock]:
        if self.mempool:
            batch = self.mempool[:]
            self.mempool.clear()
            block = self.blockchain.commit_block(batch)
            self.total_batches_committed += 1
            return block
        return None


# ==============================================================================
# 5. SIMULATION RUNNER ENGINE
# ==============================================================================

class CommercialStreetSimulation:
    def __init__(self, 
                 num_agents: int = 50, 
                 batch_size: int = 8, 
                 enable_rerouting: bool = True,
                 persona_dist: Optional[Dict[str, float]] = None):
        self.num_agents = num_agents
        self.batch_size = batch_size
        self.orchestrator = Orchestrator(batch_size=batch_size, enable_dynamic_rerouting=enable_rerouting)
        self.agents: List[ShopperAgent] = []
        self.current_tick = 0
        self.tick_metrics: List[Dict] = []

        # Default persona distribution
        self.persona_dist = persona_dist or {
            "Bargain Hunter": 0.40,
            "Window Shopper": 0.25,
            "High Spender": 0.15,
            "Rush Shopper": 0.20
        }
        self._spawn_agents()

    def _spawn_agents(self):
        personas = list(self.persona_dist.keys())
        weights = list(self.persona_dist.values())
        for i in range(self.num_agents):
            chosen_persona = random.choices(personas, weights=weights)[0]
            agent = ShopperAgent(agent_id=f"shp_{i:03d}", persona=chosen_persona)
            self.agents.append(agent)

    def step(self) -> Dict:
        self.current_tick += 1
        new_txs: List[Transaction] = []

        # 1. Step all agents
        active_count = 0
        for agent in self.agents:
            if agent.status != "FINISHED":
                active_count += 1
                tx = agent.step(self.orchestrator)
                if tx:
                    new_txs.append(tx)
                    self.orchestrator.queue_transaction(tx)

        # 2. Step orchestrator
        committed_block = self.orchestrator.process_tick()

        # 3. Snapshot metrics
        snapshot = {
            "tick": self.current_tick,
            "active_agents": active_count,
            "new_transactions": len(new_txs),
            "mempool_size": len(self.orchestrator.mempool),
            "block_committed": committed_block.block_number if committed_block else None,
            "active_incentives": dict(self.orchestrator.active_incentives),
            "congestion_rejections": self.orchestrator.congestion_rejections
        }
        self.tick_metrics.append(snapshot)
        return snapshot

    def run(self, max_ticks: int = 60, verbose: bool = True) -> Dict:
        if verbose:
            print("=" * 80)
            print(" COMMERCIAL STREET MULTI-AGENT BLOCKCHAIN RETAIL SIMULATION")
            print("=" * 80)
            print(f"Agents: {self.num_agents} | Batch Size: {self.batch_size} | "
                  f"Dynamic Rerouting: {self.orchestrator.enable_dynamic_rerouting}")
            print("-" * 80)

        for tick in range(max_ticks):
            metrics = self.step()
            if verbose and (tick % 10 == 0 or metrics["block_committed"] is not None):
                blk_str = f"Block #{metrics['block_committed']}" if metrics['block_committed'] else "No Block"
                print(f"[Tick {tick:03d}] Active Agents: {metrics['active_agents']:2d} | "
                      f"Mempool: {metrics['mempool_size']:2d} | "
                      f"{blk_str:12s} | "
                      f"Incentive Multipliers: {len(metrics['active_incentives'])} nodes")

            # Terminate early if all agents completed shopping
            if metrics["active_agents"] == 0:
                if verbose:
                    print(f"\nAll shoppers finished their shopping journeys at Tick {tick}!")
                break

        # Flush remaining mempool
        final_block = self.orchestrator.force_flush_mempool()
        if final_block and verbose:
            print(f"Final flush committed Block #{final_block.block_number} with {len(final_block.transactions)} txs.")

        summary = self.generate_summary()
        if verbose:
            self.print_summary(summary)
        return summary

    def generate_summary(self) -> Dict:
        b = self.orchestrator.blockchain
        total_tx = b.total_transactions
        hypo_l1 = b.total_l1_gas_hypothetical
        actual_l2 = b.total_rollup_gas_actual
        gas_saved_pct = ((hypo_l1 - actual_l2) / hypo_l1 * 100) if hypo_l1 > 0 else 0

        store_stats = {}
        for nid, r in self.orchestrator.retailers.items():
            store_stats[r.name] = {
                "sales_usd": round(r.total_sales_volume, 2),
                "tokens_minted": round(r.total_tokens_minted, 2),
                "congestion_events": r.congestion_events
            }

        return {
            "total_ticks": self.current_tick,
            "total_agents": self.num_agents,
            "total_transactions": total_tx,
            "total_blocks_minted": len(b.chain) - 1,
            "total_usd_volume": round(b.total_usd_volume, 2),
            "total_loyalty_tokens": round(b.total_tokens_minted, 2),
            "l1_gas_units_hypothetical": hypo_l1,
            "rollup_gas_units_actual": actual_l2,
            "gas_saved_percentage": round(gas_saved_pct, 2),
            "congestion_rejections": self.orchestrator.congestion_rejections,
            "store_stats": store_stats
        }

    def print_summary(self, summary: Dict):
        print("\n" + "=" * 80)
        print(" SIMULATION SUMMARY & ORCHESTRATOR BENCHMARK RESULTS")
        print("=" * 80)
        print(f"• Total Simulation Duration : {summary['total_ticks']} ticks")
        print(f"• Shopper Agents Processed  : {summary['total_agents']}")
        print(f"• Retail Transactions Settled: {summary['total_transactions']}")
        print(f"• Rollup Blocks Committed   : {summary['total_blocks_minted']}")
        print(f"• Gross Retail Volume (USD) : ${summary['total_usd_volume']:,.2f}")
        print(f"• Loyalty Tokens Minted     : {summary['total_loyalty_tokens']:,.2f} TOKENS")
        print(f"• L1 Gas Saved via Batching : {summary['gas_saved_percentage']:.2f}% (Reduced to {summary['rollup_gas_units_actual']:,} gas)")
        print(f"• Crowd Congestion Diverted : {summary['congestion_rejections']} overflow events avoided")
        print("-" * 80)
        print("RETAILER BREAKDOWN ON COMMERCIAL STREET:")
        for name, data in summary["store_stats"].items():
            print(f"  - {name:<26}: ${data['sales_usd']:>8.2f} sales | "
                  f"{data['tokens_minted']:>7.1f} tokens | {data['congestion_events']} crowd alerts")
        print("=" * 80 + "\n")


if __name__ == "__main__":
    sim = CommercialStreetSimulation(
        num_agents=60,
        batch_size=8,
        enable_rerouting=True
    )
    sim.run(max_ticks=80, verbose=True)
