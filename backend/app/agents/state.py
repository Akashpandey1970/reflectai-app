from typing import TypedDict, List, Optional
from pydantic import BaseModel, Field

class EvaluationSchema(BaseModel):
    groundedness: float = Field(default=8.5, description="Score 1-10 on document adherence")
    relevance: float = Field(default=8.5, description="Score 1-10 on question relevance")
    completeness: float = Field(default=8.5, description="Score 1-10 on completeness")
    overall_score: float = Field(default=8.5, description="Average score 1-10")
    critique: str = Field(default="Audited successfully.", description="Brief review")
    missing_points: List[str] = Field(default_factory=list, description="Missing facts if any")

class AgentState(TypedDict, total=False):
    question: str
    search_query: str
    context: List[str]
    generation: str
    evaluation: Optional[EvaluationSchema]
    iteration: int
    execution_trace: List[str]