import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None


def upgrade():
    op.create_table(
        "cats",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(60), nullable=False),
    )
    op.create_table(
        "feedings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("cat_id", sa.Integer(), sa.ForeignKey("cats.id"), nullable=False),
        sa.Column("fed_at", sa.BigInteger(), nullable=False),
        sqlite_autoincrement=True,
    )
    op.create_index("ix_feedings_cat_time", "feedings", ["cat_id", "fed_at", "id"])


def downgrade():
    op.drop_index("ix_feedings_cat_time", table_name="feedings")
    op.drop_table("feedings")
    op.drop_table("cats")
