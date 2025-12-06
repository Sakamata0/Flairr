export interface Comment {
    commentID: string
    flurrID: string // ID
    superCommentID?: string // ID /* for replies */
    content: string
    datePosted: Date
    /** Methods */
    getComment(): Comment
    postComment(comment: Comment): void
}