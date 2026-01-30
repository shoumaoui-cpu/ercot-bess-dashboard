"""
G-ZIP Friction Score Engine
============================
Calculates site suitability scores based on regulatory, community, and economic factors.

Formula Logic (per PRD):
- Base Score: 0 (Perfect site) to 100 (Unbuildable)
- Weights:
  1. Regulatory (40%): By-Right=0, Conditional=20, Moratorium=40
  2. Community Sentiment (30%): Welcoming=0, Neutral=15, Hostile=30
  3. Economic Cost (30%): Has Tax Abatement=0, Standard=15, High Tax/Impact Fees=30
"""

from typing import TypedDict, Literal
from dataclasses import dataclass
from enum import Enum
import json


class ZoningType(str, Enum):
    BY_RIGHT = "by-right"
    CONDITIONAL = "conditional"
    MORATORIUM = "moratorium"


class SentimentType(str, Enum):
    WELCOMING = "welcoming"
    NEUTRAL = "neutral"
    HOSTILE = "hostile"


class TaxType(str, Enum):
    ABATEMENT = "abatement"
    STANDARD = "standard"
    HIGH = "high"


# Weight configuration (per PRD)
WEIGHTS = {
    "regulatory": 0.40,
    "community": 0.30,
    "economic": 0.30
}

# Score values for each attribute
SCORE_VALUES = {
    "zoning": {
        ZoningType.BY_RIGHT: 0,
        ZoningType.CONDITIONAL: 20,
        ZoningType.MORATORIUM: 40
    },
    "sentiment": {
        SentimentType.WELCOMING: 0,
        SentimentType.NEUTRAL: 15,
        SentimentType.HOSTILE: 30
    },
    "tax": {
        TaxType.ABATEMENT: 0,
        TaxType.STANDARD: 15,
        TaxType.HIGH: 30
    }
}


@dataclass
class FrictionAttributes:
    """Input attributes for friction score calculation."""
    zoning: ZoningType
    sentiment: SentimentType
    tax: TaxType
    
    @classmethod
    def from_dict(cls, data: dict) -> "FrictionAttributes":
        return cls(
            zoning=ZoningType(data.get("zoning", "conditional")),
            sentiment=SentimentType(data.get("sentiment", "neutral")),
            tax=TaxType(data.get("tax", "standard"))
        )


@dataclass
class FrictionResult:
    """Output result from friction score calculation."""
    total_score: int
    regulatory_component: float
    community_component: float
    economic_component: float
    rating: str
    
    def to_dict(self) -> dict:
        return {
            "total_score": self.total_score,
            "components": {
                "regulatory": round(self.regulatory_component, 2),
                "community": round(self.community_component, 2),
                "economic": round(self.economic_component, 2)
            },
            "rating": self.rating
        }


def get_rating(score: int) -> str:
    """Convert numeric score to human-readable rating."""
    if score <= 20:
        return "Sweet Spot"
    elif score <= 40:
        return "Low Friction"
    elif score <= 60:
        return "Moderate"
    elif score <= 80:
        return "High Friction"
    else:
        return "Unbuildable"


def calculate_friction_score(attrs: FrictionAttributes) -> FrictionResult:
    """
    Calculate the friction score from input attributes.
    
    Args:
        attrs: FrictionAttributes containing zoning, sentiment, and tax info
        
    Returns:
        FrictionResult with total score and component breakdown
    """
    # Get raw scores
    zoning_score = SCORE_VALUES["zoning"].get(attrs.zoning, 20)
    sentiment_score = SCORE_VALUES["sentiment"].get(attrs.sentiment, 15)
    tax_score = SCORE_VALUES["tax"].get(attrs.tax, 15)
    
    # Calculate weighted components
    regulatory_component = zoning_score * WEIGHTS["regulatory"]
    community_component = sentiment_score * WEIGHTS["community"]
    economic_component = tax_score * WEIGHTS["economic"]
    
    # Total score (normalized to 0-100 scale)
    # Max possible raw weighted sum = 40*0.4 + 30*0.3 + 30*0.3 = 16 + 9 + 9 = 34
    # Scale factor = 100/34 ≈ 2.94
    raw_total = regulatory_component + community_component + economic_component
    total_score = round(raw_total * (100 / 34))
    
    # Clamp to 0-100
    total_score = max(0, min(100, total_score))
    
    return FrictionResult(
        total_score=total_score,
        regulatory_component=regulatory_component,
        community_component=community_component,
        economic_component=economic_component,
        rating=get_rating(total_score)
    )


def calculate_from_json(json_input: str) -> str:
    """
    Calculate friction score from JSON input string.
    
    Args:
        json_input: JSON string with keys: zoning, sentiment, tax
        
    Returns:
        JSON string with score result
    """
    data = json.loads(json_input)
    attrs = FrictionAttributes.from_dict(data)
    result = calculate_friction_score(attrs)
    return json.dumps(result.to_dict(), indent=2)


# Example usage and tests
if __name__ == "__main__":
    # Test cases from PRD
    test_cases = [
        # Sweet Spot (Score: 0)
        {
            "name": "Loudoun County, VA (Data Center Alley)",
            "attrs": {"zoning": "by-right", "sentiment": "welcoming", "tax": "abatement"}
        },
        # Low Friction
        {
            "name": "Harris County, TX",
            "attrs": {"zoning": "by-right", "sentiment": "welcoming", "tax": "standard"}
        },
        # Moderate
        {
            "name": "Dallas County, TX",
            "attrs": {"zoning": "conditional", "sentiment": "neutral", "tax": "standard"}
        },
        # High Friction
        {
            "name": "Travis County, TX (Austin)",
            "attrs": {"zoning": "conditional", "sentiment": "hostile", "tax": "high"}
        },
        # Unbuildable
        {
            "name": "Montgomery County, MD",
            "attrs": {"zoning": "moratorium", "sentiment": "hostile", "tax": "high"}
        }
    ]
    
    print("=" * 60)
    print("G-ZIP Friction Score Engine - Test Results")
    print("=" * 60)
    
    for case in test_cases:
        attrs = FrictionAttributes.from_dict(case["attrs"])
        result = calculate_friction_score(attrs)
        
        print(f"\n{case['name']}")
        print(f"  Input: {case['attrs']}")
        print(f"  Score: {result.total_score}/100 ({result.rating})")
        print(f"  Components: Reg={result.regulatory_component:.1f}, "
              f"Comm={result.community_component:.1f}, "
              f"Econ={result.economic_component:.1f}")
    
    print("\n" + "=" * 60)
    print("JSON API Example:")
    print("=" * 60)
    
    json_input = '{"zoning": "by-right", "sentiment": "welcoming", "tax": "abatement"}'
    print(f"Input: {json_input}")
    print(f"Output:\n{calculate_from_json(json_input)}")
