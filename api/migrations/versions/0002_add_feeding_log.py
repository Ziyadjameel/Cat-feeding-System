import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"


def upgrade():
    op.create_table(
        "feeding_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("fed_at", sa.BigInteger(), nullable=False),
    )
    op.create_index("ix_feeding_log_fed_at", "feeding_log", ["fed_at"])


def downgrade():
    op.drop_index("ix_feeding_log_fed_at", table_name="feeding_log")
    op.drop_table("feeding_log")
