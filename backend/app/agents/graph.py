from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes import retrieve_node, generate_node, evaluate_node, reflect_node

def should_continue(state: AgentState) -> str:
    eval_data = state.get("evaluation")
    iteration = state.get("iteration", 1)
    
    # Max 2 iterations allowed to prevent infinite loops
    if iteration > 2:
        return END

    if eval_data and eval_data.overall_score < 7.0:
        return "reflect"
    
    return END

def build_reflection_graph():
    graph = StateGraph(AgentState)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("generate", generate_node)
    graph.add_node("evaluate", evaluate_node)
    graph.add_node("reflect", reflect_node)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", "evaluate")
    
    graph.add_conditional_edges(
        "evaluate",
        should_continue,
        {
            "reflect": "reflect",
            END: END
        }
    )
    graph.add_edge("reflect", "retrieve")

    return graph.compile()