from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    # Time ranges
    now = datetime.now()
    last_24h = now - timedelta(hours=24)
    last_week = now - timedelta(days=7)
    yesterday = now - timedelta(days=1)

    # 1. Daily Transactions (Last 24h)
    daily_tx_count = db.query(models.Transaction).filter(
        models.Transaction.created_at >= last_24h
    ).count()
    
    # Previous day count for comparison
    prev_day_tx_count = db.query(models.Transaction).filter(
        models.Transaction.created_at >= (last_24h - timedelta(hours=24)),
        models.Transaction.created_at < last_24h
    ).count()

    # 2. Total Volume (All time)
    total_volume = db.query(func.sum(models.Transaction.amount)).scalar() or 0.0
    
    # Volume last week for comparison
    last_week_volume = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.created_at < last_week
    ).scalar() or 0.0
    
    volume_change = 0
    if last_week_volume > 0:
        volume_change = ((total_volume - last_week_volume) / last_week_volume) * 100

    # 3. Pending Issues (Failed transactions)
    pending_issues = db.query(models.Transaction).filter(
        models.Transaction.status == "failed"
    ).count()
    
    # 4. Total Users
    total_users = db.query(models.User).filter(models.User.role == models.UserRole.USER).count()

    # 5. Recent Activity
    # Get recent transactions
    recent_txs = db.query(models.Transaction).order_by(
        models.Transaction.created_at.desc()
    ).limit(5).all()
    
    # Get recent users
    recent_users = db.query(models.User).filter(
        models.User.role == models.UserRole.USER
    ).order_by(
        models.User.created_at.desc()
    ).limit(5).all()
    
    activities = []
    
    for tx in recent_txs:
        activities.append({
            "type": "transaction",
            "icon": "fa-exchange-alt",
            "text": f"Transaction: ₹{tx.amount} - {tx.description[:30]}...",
            "time": tx.created_at,
            "status": tx.status
        })
        
    for user in recent_users:
        activities.append({
            "type": "user",
            "icon": "fa-user-plus",
            "text": f"New user registration: {user.email}",
            "time": user.created_at,
            "status": "success"
        })
        
    # Sort combined activities by time
    activities.sort(key=lambda x: x["time"], reverse=True)
    activities = activities[:10] # Keep top 10

    return {
        "stats": [
            {
                "icon": "fa-users",
                "title": "Total Users",
                "value": total_users,
                "change": "Real-time",
                "positive": True
            },
            {
                "icon": "fa-exchange-alt",
                "title": "Daily Transactions",
                "value": daily_tx_count,
                "change": f"{'+' if daily_tx_count >= prev_day_tx_count else ''}{daily_tx_count - prev_day_tx_count} from yesterday",
                "positive": daily_tx_count >= prev_day_tx_count
            },
            {
                "icon": "fa-rupee-sign",
                "title": "Total Volume",
                "value": f"₹{total_volume:,.2f}",
                "change": f"{'+' if volume_change >= 0 else ''}{volume_change:.1f}% from last week",
                "positive": volume_change >= 0
            },
            {
                "icon": "fa-exclamation-triangle",
                "title": "Failed Transactions",
                "value": pending_issues,
                "change": "Requires attention" if pending_issues > 0 else "All good",
                "positive": pending_issues == 0
            }
        ],
        "activities": activities
    }

@router.get("/transactions")
def get_admin_transactions(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    transactions = db.query(models.Transaction).order_by(
        models.Transaction.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    result = []
    for tx in transactions:
        user = tx.account.owner
        result.append({
            "id": tx.id,
            "user": user.name,
            "user_email": user.email,
            "type": tx.type,
            "amount": f"₹{tx.amount:,.2f}",
            "status": tx.status,
            "date": tx.created_at.strftime("%Y-%m-%d %H:%M"),
            "description": tx.description
        })
        
    return result

@router.get("/reports/daily")
def get_daily_report(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    now = datetime.now()
    last_24h = now - timedelta(hours=24)
    
    # Total transactions in last 24h
    total_tx = db.query(models.Transaction).filter(
        models.Transaction.created_at >= last_24h
    ).count()
    
    # Total volume in last 24h
    total_vol = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.created_at >= last_24h
    ).scalar() or 0.0
    
    # Breakdown by type
    credit_tx = db.query(models.Transaction).filter(
        models.Transaction.created_at >= last_24h,
        models.Transaction.type == models.TransactionType.CREDIT
    ).count()
    
    debit_tx = db.query(models.Transaction).filter(
        models.Transaction.created_at >= last_24h,
        models.Transaction.type == models.TransactionType.DEBIT
    ).count()
    
    return {
        "title": "Daily Transaction Report",
        "generated_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        "period": "Last 24 Hours",
        "metrics": [
            {"label": "Total Transactions", "value": total_tx},
            {"label": "Total Volume", "value": f"₹{total_vol:,.2f}"},
            {"label": "Credit Transactions", "value": credit_tx},
            {"label": "Debit Transactions", "value": debit_tx}
        ]
    }

@router.get("/reports/monthly")
def get_monthly_report(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    now = datetime.now()
    last_30d = now - timedelta(days=30)
    
    # Daily volume for last 30 days
    daily_volumes = db.query(
        func.date(models.Transaction.created_at).label('date'),
        func.sum(models.Transaction.amount).label('volume'),
        func.count(models.Transaction.id).label('count')
    ).filter(
        models.Transaction.created_at >= last_30d
    ).group_by(
        func.date(models.Transaction.created_at)
    ).all()
    
    data = []
    for dv in daily_volumes:
        data.append({
            "date": dv.date,
            "volume": f"₹{dv.volume:,.2f}",
            "count": dv.count
        })
        
    return {
        "title": "Monthly Performance Summary",
        "generated_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        "period": "Last 30 Days",
        "data": data
    }

@router.get("/reports/users")
def get_user_report(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    now = datetime.now()
    last_30d = now - timedelta(days=30)
    
    total_users = db.query(models.User).filter(models.User.role == models.UserRole.USER).count()
    active_users = db.query(models.User).filter(
        models.User.role == models.UserRole.USER,
        models.User.is_active == 1
    ).count()
    blocked_users = total_users - active_users
    
    new_users_30d = db.query(models.User).filter(
        models.User.role == models.UserRole.USER,
        models.User.created_at >= last_30d
    ).count()
    
    return {
        "title": "User Analytics Report",
        "generated_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        "metrics": [
            {"label": "Total Registered Users", "value": total_users},
            {"label": "Active Users", "value": active_users},
            {"label": "Blocked Users", "value": blocked_users},
            {"label": "New Users (Last 30 Days)", "value": new_users_30d}
        ]
    }

@router.get("/loans")
def get_all_loans(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
    status: str = "all",
    skip: int = 0,
    limit: int = 100,
) -> Any:
    query = db.query(models.Loan)
    
    if status != "all":
        query = query.filter(models.Loan.status == status)
        
    loans = query.order_by(models.Loan.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for loan in loans:
        user = loan.owner
        if not user:
            # Skip valid loans that have no associated user (orphaned)
            continue
            
        result.append({
            "id": loan.id,
            "user_name": user.name,
            "user_email": user.email,
            "type": loan.type,
            "amount": loan.amount,
            "interest_rate": loan.interest_rate,
            "tenure_months": loan.tenure_months,
            "emi": loan.emi,
            "status": loan.status,
            "rejection_reason": loan.rejection_reason,
            "created_at": loan.created_at.strftime("%Y-%m-%d %H:%M")
        })
        
    return result

@router.put("/loans/{loan_id}/approve")
def approve_loan(
    loan_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
        
    loan.status = "approved"
    
    # Enable loan active flag for user if not already
    user = loan.owner
    user.is_loan_active = 1
    
    # Create a transaction for loan disbursement
    transaction = models.Transaction(
        account_id=user.accounts[0].id, # Assuming first account
        type="credit",
        amount=loan.amount,
        description=f"Loan Disbursement - {loan.type}",
        status="success"
    )
    
    # Update balance
    user.accounts[0].balance += loan.amount
    
    db.add(transaction)
    db.commit()
    return {"message": "Loan approved successfully"}

@router.put("/loans/{loan_id}/reject")
def reject_loan(
    loan_id: int,
    rejection: schemas.LoanRejection,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
        
    loan.status = "rejected"
    loan.rejection_reason = rejection.reason
    db.commit()
    return {"message": "Loan rejected"}
