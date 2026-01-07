def generate_growth_plan(vendor):
    budget = vendor.get("budget", 0)
    time = vendor.get("time_per_week", 0)
    goal = vendor.get("goal", "visibility")

    plan = {
        "do": [],
        "avoid": [],
        "platform": [],
        "content": []
    }

    # Budget-based logic
    if budget == 0:
        plan["avoid"].append("Paid advertisements")
        plan["do"].append("Collaborate with local vendors")
    else:
        plan["do"].append("Boost best performing content")

    # Time-based logic
    if time < 3:
        plan["do"].append("Post twice a week")
    else:
        plan["do"].append("Post 4–5 times a week")

    # Goal-based logic
    if goal == "visibility":
        plan["platform"].append("Instagram")
        plan["content"].append("Short reels showcasing your product")
    elif goal == "sales":
        plan["platform"].append("WhatsApp")
        plan["content"].append("Offer-based product posts")

    return plan

def generate_content_recommendation(vendor):
    budget = vendor.get("budget", 0)
    time = vendor.get("time_per_week", 0)
    goal = vendor.get("goal", "visibility")
    category = vendor.get("category", "business")

    content = {
        "frequency": "",
        "type": "",
        "caption_idea": "",
        "hashtags": []
    }

    # Posting frequency logic
    if time < 3:
        content["frequency"] = "2 posts per week"
    elif time <= 6:
        content["frequency"] = "3–4 posts per week"
    else:
        content["frequency"] = "Daily posting"

    # Content type logic
    if goal == "visibility":
        content["type"] = "Reels & Stories"
        content["caption_idea"] = "A behind-the-scenes look at how we create our products"
    elif goal == "sales":
        content["type"] = "Product posts"
        content["caption_idea"] = "Limited-time offer on our best-selling product"

    # Budget-aware adjustment
    if budget == 0:
        content["caption_idea"] += " (organic reach focused)"

    # Hashtag logic
    content["hashtags"] = [
        "#smallbusiness",
        "#localvendor",
        f"#{category.lower()}"
    ]

    return content

def calculate_match_score(vendor_a, vendor_b):
    score = 0

    if vendor_a.get("goal") == vendor_b.get("goal"):
        score += 2

    if vendor_a.get("category") == vendor_b.get("category"):
        score += 2
    else:
        score += 1  # complementary category

    budget_diff = abs(vendor_a.get("budget", 0) - vendor_b.get("budget", 0))
    if budget_diff <= 1:
        score += 1

    return score

def check_expansion_eligibility(vendor, collaborations_count):
    time = vendor.get("time_per_week", 0)
    budget = vendor.get("budget", 0)
    goal = vendor.get("goal")

    result = {
        "eligible": False,
        "reason": "",
        "recommended_support": []
    }

    if time < 3:
        result["reason"] = "Insufficient time capacity"
        return result

    if budget == 0 and collaborations_count == 0:
        result["reason"] = "No budget or active collaborations"
        result["recommended_support"] = [
            "Collaboration-based promotion",
            "Organic content strategy"
        ]
        return result

    result["eligible"] = True
    result["reason"] = "Meets minimum expansion criteria"

    if budget > 0:
        result["recommended_support"].append("Paid advertising")

    if collaborations_count > 0:
        result["recommended_support"].append("Cross-vendor campaigns")

    return result
