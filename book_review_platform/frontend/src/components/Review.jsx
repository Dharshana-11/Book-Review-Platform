import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Input, Avatar, List, message, Divider, Dropdown, Menu } from "antd";
import { HeartOutlined, HeartFilled, EllipsisOutlined, LeftOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import api from "../api/axiosInstance";
import { useLocation } from "react-router-dom";
import "../styles/Review.css";
import BASE_URL from "../config";

const Review = () => {
  const location = useLocation();
  const { bookId, title, authors } = location.state;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedReportReview, setSelectedReportReview] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const currentUsername = localStorage.getItem("username");  // Assuming the username is saved in localStorage


  // Fetch reviews from the backend
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reviews/${bookId}/`);
      console.log(response);
  
      if (Array.isArray(response.data)) {
        // Map the backend response to include the correct `hasLiked` field
        const mappedReviews = response.data.map((review) => ({
          ...review,
          hasLiked: review.has_liked, // Explicitly map `has_liked` to `hasLiked`
        }));
        setReviews(mappedReviews);
      } else if (response.data.message) {
        // Handle the case where there are no reviews
        message.info(response.data.message);
        setReviews([]); // Set an empty array if no reviews are available
      } else {
        setReviews([]); // Set empty array if the response is neither an array nor a message
      }
    } catch (error) {
      message.error("Failed to load reviews.");
      setReviews([]); // Set empty array in case of error
    } finally {
      setLoading(false);
    }
  }, [bookId]);
  
  // Add a new review
  const addReview = async () => {
    if (!newReview.trim()) {
      message.warning("Review cannot be empty!");
      return;
    }
    try {
      const response = await api.post(`/reviews/${bookId}/`, {
        content: newReview,
        book: { google_id: bookId, title, authors },
      });
      console.log(response)
      setReviews((prev) => [response.data, ...prev]);
      message.success("Review added successfully!");
      setIsModalVisible(false);
      setNewReview("");
    } catch (error) {
      message.error("Failed to add review.");
    }
  };

  // Update an existing review
  const updateReview = async () => {
    if (!newReview.trim()) {
      message.warning("Review cannot be empty!");
      return;
    }
    try {
      const response = await api.put(`/reviews/review/${editingReview.id}/`, {
        content: newReview,
        book: { google_id: bookId, title, authors },
      });
      console.log(response)
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === editingReview.id ? { ...review, content: newReview } : review
        )
      );
      message.success("Review updated successfully!");
      setIsModalVisible(false);
      setEditingReview(null);
      setNewReview("");
    } catch (error) {
      message.error("Failed to update review.");
    }
  };

  // Handle liking/unliking a review
  const handleLike = async (reviewId) => {
    try {
      const response = await api.post(`/reviews/like/${reviewId}/`);
      const { likes, message: serverMessage } = response.data;
  
      // Update the review state based on the new 'likes' and 'has_liked' from the server
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? { ...review, likes_count: likes, hasLiked: response.data.has_liked }  // Set hasLiked here
            : review
        )
      );
  
      message.success(serverMessage);
    } catch (error) {
      console.error("Error liking the review", error);
    }
  };
  
  const confirmDelete = (reviewId) => {
    setSelectedReviewId(reviewId); // Store the review ID to delete
    setIsDeleteModalVisible(true); // Show the confirmation modal
  };
  
  // Handle Delete Review
  const handleDelete = async () => {
    try {
      await api.delete(`reviews/review/${selectedReviewId}/`);
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== selectedReviewId));
      message.success("Review deleted successfully!");
    } catch (error) {
      message.error("Failed to delete review.");
    }
    setIsDeleteModalVisible(false); // Close the modal after deletion
  };  

  // Dropdown menu for three dots options (Edit, Delete (or) Report review)
  const optionsMenu = (reviewId, reviewContent, reviewUserUsername) => (
    <Menu>
      {reviewUserUsername === currentUsername ? (
        <>
          <Menu.Item className="menu-item" onClick={() => handleEdit(reviewId, reviewContent)}>
            <EditOutlined /> Edit Review
          </Menu.Item>
          <Menu.Item 
            className="menu-item delete" 
            onClick={() => confirmDelete(reviewId)} 
          >
            <span className="delete-text"> <DeleteOutlined /> Delete Review </span>
          </Menu.Item>
        </>
      ) : (
        <Menu.Item
          className="menu-item report"
          onClick={() => handleReport(reviewId)}
        > 
          <span className="report-text"><ExclamationCircleOutlined/> Report Review</span>
        </Menu.Item>
      )}
    </Menu>
  );
  
  
  const handleReport = (reviewId) => {
    setSelectedReportReview(reviewId);
    setIsReportModalVisible(true);
  };  

  const submitReport = async () => {
    if (!reportReason.trim()) {
      message.warning("Please select a reason for reporting.");
      return;
    }
    try {
      await api.post(`/reviews/report/${selectedReportReview}/`, {
        reason: reportReason,
      });
      message.success("Reported successfully!");
      setIsReportModalVisible(false);
      setReportReason("");
    } catch (error) {
      message.error("Failed to report the review.");
    }
  };
  
  
  // Handle Edit Review
  const handleEdit = (reviewId, reviewContent) => {
    setEditingReview({ id: reviewId });
    setNewReview(reviewContent);
    setIsModalVisible(true);
  };

const lineHeight = 22; // Line height in px (adjust based on your CSS)
const maxHeight = lineHeight * 3; // Max height for 3 lines

const checkTruncation = useCallback((id, content) => {
  const tempElement = document.createElement("div");
  tempElement.style.position = "absolute";
  tempElement.style.visibility = "hidden";
  tempElement.style.width = "100%";
  tempElement.style.lineHeight = `${lineHeight}px`;
  tempElement.style.whiteSpace = "normal";
  tempElement.style.overflow = "hidden";
  tempElement.innerHTML = content.replace(/\n/g, "<br>"); // Respect paragraphs
  document.body.appendChild(tempElement);

  const isContentTruncated = tempElement.offsetHeight > maxHeight;
  setExpandedReviews((prev) => ({
    ...prev,
    [id]: { expanded: false, truncated: isContentTruncated },
  }));

  document.body.removeChild(tempElement);
}, [maxHeight]);

const toggleExpanded = (reviewId) => {
  setExpandedReviews((prev) => ({
    ...prev,
    [reviewId]: { ...prev[reviewId], expanded: !prev[reviewId]?.expanded },
  }));
};

useEffect(() => {
  fetchReviews();
}, [fetchReviews]);

useEffect(() => {
  if (Array.isArray(reviews)) {
    reviews.forEach((review) => {
      if (!expandedReviews[review.id]) {
        checkTruncation(review.id, review.content);
      }
    });
  } else {
    console.error("Reviews is not an array", reviews);
  }
}, [reviews, expandedReviews, checkTruncation]);

return (
  <div className="review-content">
    <div className="review-header">
      <div>
        <Button type="link" onClick={() => window.history.back()} className="review-back-btn">
          <LeftOutlined />
        </Button>
        <h2 className="review-book-title">Reviews for {title}</h2>
      </div>
      <div>
        <Button type="primary" onClick={() => setIsModalVisible(true)} className="review-btn">
          Add your Review
        </Button>
      </div>
    </div>

    {reviews.length === 0 ? (
      <div className="no-reviews-message">
        <div className="no-reviews-icon">
          {/* <i className="fas fa-comment-slash"></i> Optional icon */}
        </div>
        <p>No reviews available. Be the first one to add a review!</p>
      </div>
    ) : (
      <List
  loading={loading}
  dataSource={reviews}
  renderItem={(review) => {
    const isExpanded = expandedReviews[review.id]?.expanded;

    return (
      <List.Item key={review.id} className="review-item">
        <div className="review-card">
          <div className="review-card-header">
            <Avatar
              src={`${BASE_URL}${review.user?.profile_pic}`}
              className="review-avatar"
              size={64}
            />
            <div className="review-user">
              <span className="review-username">{review.user?.username}</span>
            </div>
            <Dropdown overlay={optionsMenu(review.id, review.content, review.user?.username)} trigger={["click"]}>
              <EllipsisOutlined className="review-options" />
            </Dropdown>
          </div>
          <div className="review-content">
            <p className={isExpanded ? "expanded" : ""}>
              {review.content}
            </p>
            {expandedReviews[review.id]?.truncated && (
              <span
                onClick={() => toggleExpanded(review.id)}
                className="see-more-toggle"
              >
                {isExpanded ? "See Less" : "See More"}
              </span>
            )}
            <Divider />
            <div className="review-footer">
              <Button
                icon={review.hasLiked ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => handleLike(review.id)}
                className="like-btn"
                type="text"
                style={{ color: review.hasLiked ? "red" : "black" }}
              >
                {review.likes_count} Likes
              </Button>
            </div>
          </div>
        </div>
      </List.Item>
    );
  }}
/>
)}

    <Modal
      title="Delete Review"
      open={isDeleteModalVisible}
      onOk={handleDelete}  // Call the handleDelete function if confirmed
      onCancel={() => setIsDeleteModalVisible(false)}  // Close the modal without deleting
      okText="Yes, Delete"
      okButtonProps={{ danger: true }}
      cancelText="Cancel"
    >
      <p>Are you sure you want to delete this review? This action cannot be undone.</p>
    </Modal>

    <Modal
      title={editingReview ? "Edit Review" : "Add a Review"}
      open={isModalVisible}
      onOk={editingReview ? updateReview : addReview}
      onCancel={() => {
        setIsModalVisible(false);
        setEditingReview(null);
        setNewReview("");
      }}
    >
      <Input.TextArea
        rows={4}
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)}
        placeholder="Write your review here..."
      />
    </Modal>

    <Modal
      title="Report Review"
      open={isReportModalVisible}
      onOk={submitReport}
      onCancel={() => {
        setIsReportModalVisible(false);
        setReportReason("");
      }}
      okText="Report"
      cancelText="Cancel"
    >
      <p>Please select a reason for reporting this review:</p>
      <List
        dataSource={["Spam", "Inappropriate Content", "Harassment", "Hate Speech", "Other"]}
        renderItem={(reason) => (
          <List.Item
            onClick={() => setReportReason(reason)}
            className={`report-reason-item ${reportReason === reason ? "active" : ""}`}
            style={{ padding: '10px' }} 
          >
            {reason}
          </List.Item>
        )}
      />
    </Modal>
  </div>
);
};

export default Review;