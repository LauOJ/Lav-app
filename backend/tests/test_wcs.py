import pytest

from models import Review, User, WC


def test_get_wcs_empty(client):
    response = client.get("/wcs")
    assert response.status_code == 200
    assert response.json() == []


def test_scores_with_reviews(client, db):
    first_user = User(email="tester@example.com", password_hash="hashed-password")
    second_user = User(email="tester2@example.com", password_hash="hashed-password-2")
    wc = WC(
        name="WC Centro",
        latitude=41.38,
        longitude=2.17,
        is_public=True,
        has_changing_table=False,
        description="Test WC",
    )
    db.add_all([first_user, second_user, wc])
    db.commit()
    db.refresh(first_user)
    db.refresh(second_user)
    db.refresh(wc)

    review_1 = Review(
        cleanliness_rating=4,
        felt_safe=True,
        accessible=True,
        has_toilet_paper=True,
        hygiene_products_available=True,
        could_enter_without_buying=True,
        has_gender_mixed_option=True,
        comment="First review",
        user_id=first_user.id,
        wc_id=wc.id,
    )
    review_2 = Review(
        cleanliness_rating=2,
        felt_safe=False,
        accessible=True,
        has_toilet_paper=False,
        hygiene_products_available=False,
        could_enter_without_buying=False,
        has_gender_mixed_option=False,
        comment="Second review",
        user_id=second_user.id,
        wc_id=wc.id,
    )

    db.add_all([review_1, review_2])
    db.commit()

    response = client.get("/wcs")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1

    item = payload[0]
    assert item["reviews_count"] == 2
    assert item["avg_cleanliness"] == pytest.approx(3.0)
    assert item["safety_score"] == pytest.approx(50.0)
    assert item["accessibility_score"] == pytest.approx(100.0)
    assert item["toilet_paper_score"] == pytest.approx(50.0)
