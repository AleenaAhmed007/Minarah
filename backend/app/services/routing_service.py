from heapq import heappush, heappop
from typing import List
from ..models.route import RouteResponse
from ..config import db


class RoutingService:
    def __init__(self, graph_collection):
        if graph_collection is None:
            raise ValueError("❌ graph_collection is not initialized. Attach MongoDB collection.")
        self.graph = graph_collection
        self.cache = {}  # local cache

    # -------------------------------
    # Heuristic (Euclidean Distance)
    # -------------------------------
    def heuristic(self, a, b):
        return ((a["lat"] - b["lat"])**2 + (a["lng"] - b["lng"])**2) ** 0.5

    # -------------------------------
    # Fetch Node (cached)
    # -------------------------------
    def get_node(self, node_id):
        if node_id in self.cache:
            return self.cache[node_id]

        node = self.graph.find_one({"_id": node_id})
        if node:
            self.cache[node_id] = node
        return node

    # -------------------------------
    # A* Routing Function
    # -------------------------------
    def find_route(self, start, end, flooded_ids: List[str] = []):
        if start is None or end is None:
            return {"status": "ERROR", "message": "Start or End node not found."}

        queue = []
        heappush(queue, (0, start["_id"]))

        visited = {}
        parent = {}

        while queue:
            cost, current = heappop(queue)

            if current == end["_id"]:
                break

            current_node = self.get_node(current)
            if not current_node or "neighbors" not in current_node:
                continue

            neighbors = current_node["neighbors"]

            for neighbor_id, distance in neighbors.items():

                # skip flooded roads
                if neighbor_id in flooded_ids:
                    continue

                new_cost = cost + float(distance)

                if neighbor_id not in visited or new_cost < visited[neighbor_id]:
                    visited[neighbor_id] = new_cost
                    parent[neighbor_id] = current

                    neighbor_node = self.get_node(neighbor_id)
                    if not neighbor_node:
                        continue

                    priority = new_cost + self.heuristic(neighbor_node, end)
                    heappush(queue, (priority, neighbor_id))

        # -------------------------------
        # Build the final path
        # -------------------------------
        if end["_id"] not in parent:
            return {
                "status": "NO_ROUTE",
                "message": "No path found (maybe all paths blocked or flooded)."
            }

        path = []
        node = end["_id"]
        while node in parent:
            path.append(node)
            node = parent[node]
        path.append(start["_id"])
        path.reverse()

        return {
            "status": "OK",
            "path": path,
            "distance": visited.get(end["_id"], 0)
        }


# FIXED: Inject proper MongoDB collection
routing_service = RoutingService(db["road_graph"])
